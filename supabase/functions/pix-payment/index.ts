import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { logWebhookEvent, markAsProcessed, markAsFailed } from "../_shared/webhook-handler.ts"


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const url = new URL(req.url)
    let body: any = {}
    if (req.method === "POST") {
      body = await req.json().catch(() => ({}))
    }

    const path = body.path || url.searchParams.get("path") || url.pathname.split("/").pop()

    // Fetch site settings to determine provider and credentials
    const { data: settingsData } = await supabaseClient.from("site_settings").select("key, value");
    const settings: Record<string, string> = {};
    settingsData?.forEach(s => { settings[s.key] = s.value; });

    const activeProvider = settings.active_payment_provider || "mercadopago";

    if (path === "create") {
      const orderId = body.orderId
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .select("*, campaigns(title)")
        .eq("id", orderId)
        .single()

      if (orderError || !order) throw new Error("Order not found")

      if (order.pix_code && order.pix_qr_code_base64 && order.payment_status !== 'pending') {
         // Return existing if already generated and provider hasn't changed? 
         // For now, let's allow regeneration if provider changed or if requested
      }

      if (activeProvider === 'manual') {
        const pixCode = settings.manual_payment_pix_key || "";
        const pixName = settings.manual_payment_pix_name || "";
        
        // Return a mock response or the actual manual pix info
        return new Response(JSON.stringify({
          pix_code: pixCode,
          pix_qr_code_base64: null, // No QR for manual pix usually
          is_manual: true,
          pix_name: pixName
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      if (activeProvider === 'mercadopago') {
        const mpAccessToken = settings.mercadopago_access_token || Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")
        if (!mpAccessToken) throw new Error("Mercado Pago Access Token não configurado.")

        const response = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${mpAccessToken}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": orderId
          },
          body: JSON.stringify({
            transaction_amount: Number(order.total_amount),
            description: `Rifa - ${order.campaigns?.title || 'Pedido'} - ${orderId.slice(0, 8)}`,
            payment_method_id: "pix",
            payer: {
              email: "cliente@rifapro.com",
              first_name: "Cliente",
              last_name: "RifaPro"
            },
            external_reference: orderId,
            notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/pix-payment?path=webhook`
          })
        })

        const mpData = await response.json()
        if (!response.ok) {
          console.error("MP Error:", mpData);
          throw new Error(mpData.message || "Erro ao gerar PIX no Mercado Pago")
        }

        const pixCode = mpData.point_of_interaction.transaction_data.qr_code
        const pixQrBase64 = mpData.point_of_interaction.transaction_data.qr_code_base64

        await supabaseClient.from("orders").update({
          pix_code: pixCode,
          pix_qr_code_base64: pixQrBase64
        }).eq("id", orderId)

        return new Response(JSON.stringify({
          pix_code: pixCode,
          pix_qr_code_base64: pixQrBase64
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        })
      }

      // Fallback for unknown provider
      throw new Error(`Provedor de pagamento '${activeProvider}' não suportado no momento.`)
    }

    if (path === "webhook") {
      const topic = body.topic || url.searchParams.get("topic") || body.type
      const id = body.resource?.split("/").pop() || body.data?.id || url.searchParams.get("id") || body.id

      console.log(`[PIX Webhook] Received: Topic=${topic}, ID=${id}`);

      if ((topic === "payment" || topic === "payment.updated") && id) {
        // Check for idempotency
        const { data: existing } = await supabaseClient
          .from('processed_webhooks')
          .select('id')
          .eq('id', `mp_pix_${id}`)
          .maybeSingle();
        
        if (existing) {
          console.log(`[PIX Webhook] Already processed payment ${id}. Skipping.`);
          return new Response(JSON.stringify({ received: true, already_processed: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        const mpAccessToken = settings.mercadopago_access_token || Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: { "Authorization": `Bearer ${mpAccessToken}` }
        })
        const paymentData = await response.json()
        
        console.log(`[PIX Webhook] Payment ${id} status: ${paymentData.status}`);

        if (paymentData.status === "approved") {
          const orderId = paymentData.external_reference
          console.log(`[PIX Webhook] Approving order ${orderId} for payment ${id}`);
          
          // Call the RPC to handle confirmed payment
          const { error: rpcError } = await supabaseClient.rpc("handle_order_payment", { p_order_id: orderId })
          
          if (!rpcError) {
             // Mark as processed
             await supabaseClient
               .from('processed_webhooks')
               .insert({ id: `mp_pix_${id}`, provider: 'mercadopago' });
          } else {
             console.error("[PIX Webhook] RPC Error:", rpcError)
          }
        }
      }
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    }

    return new Response("Not Found", { status: 404 })
  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
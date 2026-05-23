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

    // Fetch site settings for credentials
    const { data: settingsData } = await supabaseClient.from("site_settings").select("key, value");
    const settings: Record<string, string> = {};
    settingsData?.forEach(s => { settings[s.key] = s.value; });

    const mpAccessToken = settings.mercadopago_access_token;
    if (!mpAccessToken) throw new Error("Mercado Pago Access Token não configurado.");

    if (path === "create") {
      const orderId = body.orderId
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .select("*, campaigns(title)")
        .eq("id", orderId)
        .single()

      if (orderError || !order) throw new Error("Order not found")

      // Create Preference for checkout redirect
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${mpAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: order.campaigns.title,
              quantity: 1,
              unit_price: Number(order.total_amount),
              currency_id: "BRL"
            }
          ],
          external_reference: orderId,
          back_urls: {
            success: `${req.headers.get("origin")}/checkout/${orderId}?status=success`,
            failure: `${req.headers.get("origin")}/checkout/${orderId}?status=failure`,
            pending: `${req.headers.get("origin")}/checkout/${orderId}?status=pending`
          },
          auto_return: "approved",
          notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-payment?path=webhook`
        })
      })

      const mpData = await response.json()
      if (!response.ok) {
        console.error("MP Error:", mpData);
        throw new Error(mpData.message || "Erro ao gerar checkout no Mercado Pago")
      }

      return new Response(JSON.stringify({ init_point: mpData.init_point }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    }

    if (path === "webhook") {
      const topic = body.topic || url.searchParams.get("topic") || body.type
      const id = body.resource?.split("/").pop() || body.data?.id || url.searchParams.get("id") || body.id

      console.log(`[MP Webhook] Received: Topic=${topic}, ID=${id}`);

      if ((topic === "payment" || topic === "payment.updated") && id) {
        // Check for idempotency
        const { data: existing } = await supabaseClient
          .from('processed_webhooks')
          .select('id')
          .eq('id', `mp_${id}`)
          .maybeSingle();
        
        if (existing) {
          console.log(`[MP Webhook] Already processed payment ${id}. Skipping.`);
          return new Response(JSON.stringify({ received: true, already_processed: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: { "Authorization": `Bearer ${mpAccessToken}` }
        })
        const paymentData = await response.json()
        
        console.log(`[MP Webhook] Payment ${id} status: ${paymentData.status}`);

        if (paymentData.status === "approved") {
          const orderId = paymentData.external_reference
          console.log(`[MP Webhook] Approving order ${orderId} for payment ${id}`);
          
          // Call the RPC to handle confirmed payment (handles tickets, stats, etc.)
          const { error: rpcError } = await supabaseClient.rpc("handle_order_payment", { p_order_id: orderId })
          
          if (!rpcError) {
            // Mark as processed
            await supabaseClient
              .from('processed_webhooks')
              .insert({ id: `mp_${id}`, provider: 'mercadopago' });
          } else {
            console.error("[MP Webhook] RPC Error:", rpcError)
            // Fallback to direct update if RPC fails
            const { error: updateError } = await supabaseClient
              .from('orders')
              .update({ 
                  payment_status: 'paid',
                  paid_at: new Date().toISOString()
              })
              .eq('id', orderId)
              .neq('payment_status', 'paid');
            
            if (!updateError) {
              await supabaseClient
                .from('processed_webhooks')
                .insert({ id: `mp_${id}`, provider: 'mercadopago' });
            }
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
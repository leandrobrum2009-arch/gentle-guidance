 import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders })
   }
 
   try {
     const supabaseClient = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     )
 
     const url = new URL(req.url)
     const body = await req.json().catch(() => ({}))
     const path = body.path || url.pathname.split('/').pop()
 
     if (path === 'create' || body.path === 'create') {
       const orderId = body.orderId
 
       // Fetch order
       const { data: order, error: orderError } = await supabaseClient
         .from('orders')
         .select('*')
         .eq('id', orderId)
         .single()
 
       if (orderError || !order) throw new Error('Order not found')
 
       // Check if pix_code already exists
       if (order.pix_code && order.pix_qr_code_base64) {
         return new Response(JSON.stringify({ 
           pix_code: order.pix_code, 
           pix_qr_code_base64: order.pix_qr_code_base64 
         }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 200,
         })
       }
 
       const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
       if (!mpAccessToken) {
         throw new Error('MERCADO_PAGO_ACCESS_TOKEN not set')
       }
 
       console.log(`Creating PIX payment for order ${orderId} with amount ${order.total_amount}`)
 
       const response = await fetch('https://api.mercadopago.com/v1/payments', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${mpAccessToken}`,
           'Content-Type': 'application/json',
           'X-Idempotency-Key': orderId
         },
         body: JSON.stringify({
           transaction_amount: Number(order.total_amount),
           description: `Rifa - Pedido ${orderId}`,
           payment_method_id: 'pix',
           payer: {
             email: 'customer@example.com', // Placeholder or fetch from auth
             first_name: 'Cliente',
             last_name: 'Rifa'
           },
           external_reference: orderId,
           // We'll use the current URL to construct the webhook URL
           notification_url: `${url.origin}/pix-payment/webhook`
         })
       })
 
       const mpData = await response.json()
 
       if (!response.ok) {
         console.error('MP Error:', mpData)
         throw new Error(mpData.message || 'Error creating MP payment')
       }
 
       const pixCode = mpData.point_of_interaction.transaction_data.qr_code
       const pixQrBase64 = mpData.point_of_interaction.transaction_data.qr_code_base64
 
       // Update order
       await supabaseClient
         .from('orders')
         .update({ 
           pix_code: pixCode, 
           pix_qr_code_base64: pixQrBase64 
         })
         .eq('id', orderId)
 
       return new Response(JSON.stringify({ 
         pix_code: pixCode, 
         pix_qr_code_base64: pixQrBase64 
       }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
     }
 
     if (path === 'webhook') {
       // MP might send data in query params or body
       const webhookBody = await req.json().catch(() => ({}))
       const topic = webhookBody.topic || url.searchParams.get('topic')
       const id = webhookBody.resource?.split('/').pop() || webhookBody.data?.id || url.searchParams.get('id')
 
       console.log('Webhook received:', { topic, id, body: webhookBody })
 
       if ((topic === 'payment' || webhookBody.type === 'payment') && id) {
         const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')
         
         const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
           headers: { 'Authorization': `Bearer ${mpAccessToken}` }
         })
         const paymentData = await response.json()
 
         if (paymentData.status === 'approved') {
           const orderId = paymentData.external_reference
           
           console.log(`Payment approved for order ${orderId}`)
           
           // Use the atomic function
           const { error } = await supabaseClient.rpc('handle_order_payment', { p_order_id: orderId })
           if (error) console.error('Error handling payment:', error)
           else console.log(`Order ${orderId} marked as paid via webhook`)
         }
       }
 
       return new Response(JSON.stringify({ received: true }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
     }
 
     return new Response('Not Found', { status: 404 })
 
   } catch (error) {
     console.error('Edge Function Error:', error)
     return new Response(JSON.stringify({ error: error.message }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     })
   }
 })
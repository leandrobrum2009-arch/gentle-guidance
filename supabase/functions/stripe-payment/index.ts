 import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
 import Stripe from 'https://esm.sh/stripe@14.21.0'
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
 
 const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
   apiVersion: '2023-10-16',
   httpClient: Stripe.createFetchHttpClient(),
 })
 
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
       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
     )
 
     const { orderId, path } = await req.json()
 
     if (path === 'create') {
       const { data: order, error: orderError } = await supabaseClient
         .from('orders')
         .select('*, campaigns(title)')
         .eq('id', orderId)
         .single()
 
       if (orderError || !order) {
         throw new Error('Order not found')
       }
 
       const session = await stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         line_items: [
           {
             price_data: {
               currency: 'brl',
               product_data: {
                 name: order.campaigns.title,
                 description: `${order.quantity} bilhetes`,
               },
               unit_amount: Math.round(order.total_amount * 100),
             },
             quantity: 1,
           },
         ],
         mode: 'payment',
         success_url: `${req.headers.get('origin')}/checkout/${orderId}?success=true`,
         cancel_url: `${req.headers.get('origin')}/checkout/${orderId}?canceled=true`,
         metadata: {
           orderId: order.id,
         },
       })
 
       await supabaseClient
         .from('orders')
         .update({ stripe_session_id: session.id })
         .eq('id', orderId)
 
       return new Response(JSON.stringify({ url: session.url }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
     }
 
     if (path === 'webhook') {
       const signature = req.headers.get('stripe-signature')
       const body = await req.text()
       
       let event
       try {
         event = stripe.webhooks.constructEvent(
           body,
           signature!,
           Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
         )
       } catch (err) {
         return new Response(`Webhook Error: ${err.message}`, { status: 400 })
       }
 
       if (event.type === 'checkout.session.completed') {
         const session = event.data.object
         const orderId = session.metadata.orderId
 
         const { error: updateError } = await supabaseClient
           .from('orders')
           .update({ 
             payment_status: 'paid',
             paid_at: new Date().toISOString()
           })
           .eq('id', orderId)
 
         if (updateError) console.error('Error updating order:', updateError)
       }
 
       return new Response(JSON.stringify({ received: true }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
     }
 
     return new Response('Not Found', { status: 404 })
   } catch (error) {
     return new Response(JSON.stringify({ error: error.message }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     })
   }
 })
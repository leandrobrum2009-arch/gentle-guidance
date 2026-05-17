 import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
 
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
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
     )
 
     const response = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest')
     if (!response.ok) throw new Error('Failed to fetch lottery result')
     
     const data = await response.json()
     
     // Map prizes to our format
     const premios = data.premios.map((p: any) => ({
       premio: p.premio,
       numero: p.numero
     }))
 
     const { data: existing, error: checkError } = await supabaseClient
       .from('federal_lottery_results')
       .select('id')
       .eq('concurso', data.concurso.toString())
       .maybeSingle()
 
     if (!existing) {
       const { error: insertError } = await supabaseClient
         .from('federal_lottery_results')
         .insert({
           concurso: data.concurso.toString(),
           data_sorteio: data.data,
           premios: premios
         })
       
       if (insertError) throw insertError
     }
 
     return new Response(JSON.stringify(data), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 200,
     })
   } catch (error) {
     return new Response(JSON.stringify({ error: error.message }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     })
   }
 })
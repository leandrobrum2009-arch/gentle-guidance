import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-id@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml",
};

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("slug, updated_at")
    .eq("status", "active");

  const baseUrl = Deno.env.get("SITE_URL") || "https://suarifa.com.br";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/ganhadores</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/resultado-federal</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/roleta-premiada</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/raspadinha-da-sorte</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/caixa-misteriosa-de-premios</loc>
    <priority>0.7</priority>
  </url>`;

  campaigns?.forEach((campaign) => {
    xml += `
  <url>
    <loc>${baseUrl}/rifa/${campaign.slug}</loc>
    <lastmod>${new Date(campaign.updated_at).toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return new Response(xml, { headers: corsHeaders });
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');
  
  if (error) {
    console.error("Error fetching settings:", error.message);
  } else {
    console.log("Fetched settings keys:", data.map(d => d.key));
    const logo = data.find(d => d.key === 'site_logo_url');
    console.log("Logo URL:", logo ? logo.value : "NOT FOUND");
  }
}

checkSettings();

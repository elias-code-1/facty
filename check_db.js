import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("URL exists:", !!url);
console.log("Key exists:", !!serviceKey);

if (url && serviceKey) {
  const supabase = createClient(url, serviceKey);

  async function check() {
    const { data, error } = await supabase.from('invoice_items').select('*').limit(5);
    console.log("Service key fetch invoice_items:", data?.length, error);
  }

  check();
}

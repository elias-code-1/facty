import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url && serviceKey) {
  const supabase = createClient(url, serviceKey);

  async function check() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .order('created_at', { ascending: false })
      .limit(3);
    
    console.log(JSON.stringify(data, null, 2));
  }

  check();
}

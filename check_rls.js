import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url && serviceKey) {
  const supabase = createClient(url, serviceKey);

  async function check() {
    const { data: policies, error } = await supabase.rpc('query', { 
      query_text: "SELECT tablename, policyname, permiss, roles, cmd FROM pg_policies WHERE tablename = 'invoice_items';"
    });
    // This probably won't work as rpc needs a defined function.
    // Let me try querying raw sql from a known table or via REST? Supabase doesn't allow direct raw SQL from client.
  }
}

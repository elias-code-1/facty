import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url && serviceKey) {
  const supabase = createClient(url, serviceKey);

  async function check() {
    // try to find invoices without items
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .order('created_at', { ascending: false })
      .limit(10);
      
    const emptyItems = data?.filter(inv => !inv.items || inv.items.length === 0);
    console.log("Invoices with no items:", emptyItems?.length);
    if (emptyItems?.length) {
      console.log(JSON.stringify(emptyItems, null, 2));
    }
  }

  check();
}

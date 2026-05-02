import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url && serviceKey) {
  const supabase = createClient(url, serviceKey);

  async function check() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .gt('total', 0);
      
    // Count how many have zero items
    const emptyItems = data?.filter(inv => !inv.items || inv.items.length === 0);
    console.log(`Total invoices with total > 0: ${data?.length}`);
    console.log(`Invoices with total > 0 BUT items length == 0: ${emptyItems?.length}`);
    
    if (emptyItems?.length) {
       console.log("IDs of corrupted invoices:");
       emptyItems.forEach(i => console.log(i.id, i.invoice_number, i.created_at));
    }
  }

  check();
}

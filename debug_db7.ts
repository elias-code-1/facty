import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  const { data: policies, error } = await supabase.rpc('get_policies');
  // Wait, get_policies doesn't exist. I can query pg_policies.
  const { data, error: sqlError } = await supabase.from('pg_policies').select('*').eq('tablename', 'team_members');
  console.log('Policies:', data);
  if (sqlError) console.error(sqlError);
}

debug();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, email, role, team_role');
  console.log('All Profiles:', JSON.stringify(allProfiles, null, 2));
}

debug();

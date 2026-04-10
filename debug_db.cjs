const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('--- DEBUG START ---');
  
  const { data: teamMembers, error: teamError } = await supabase
    .from('team_members')
    .select('*');
  console.log('Team Members:', JSON.stringify(teamMembers, null, 2));
  if (teamError) console.error('Team Members Error:', teamError);

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('email, role, team_role');
  console.log('All Profiles (subset):', JSON.stringify(allProfiles, null, 2));

  console.log('--- DEBUG END ---');
}

debug();

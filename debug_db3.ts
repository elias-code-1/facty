import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  console.log('All Profiles:', JSON.stringify(allProfiles, null, 2));

  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
  console.log('Auth Users:', JSON.stringify(users.users.map(u => ({ email: u.email, id: u.id })), null, 2));

  console.log('--- DEBUG END ---');
}

debug();

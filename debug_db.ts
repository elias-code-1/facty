import { supabase } from './src/lib/supabase';

async function debug() {
  console.log('--- DEBUG START ---');
  
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current Auth User:', user?.email, user?.id);

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    console.log('Current Profile:', profile);
  }

  const { data: teamMembers, error: teamError } = await supabase
    .from('team_members')
    .select('*');
  console.log('Team Members:', teamMembers);
  if (teamError) console.error('Team Members Error:', teamError);

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('email, role, team_role');
  console.log('All Profiles (subset):', allProfiles);

  console.log('--- DEBUG END ---');
}

debug();

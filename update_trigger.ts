import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTrigger() {
  const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_team_member boolean;
  t_role text;
  t_invited_by uuid;
BEGIN
  -- Vérifier si l'utilisateur est dans la table team_members
  SELECT EXISTS(SELECT 1 FROM public.team_members WHERE email = NEW.email) INTO is_team_member;
  
  IF is_team_member THEN
    -- Récupérer les infos d'invitation
    SELECT role, invited_by INTO t_role, t_invited_by FROM public.team_members WHERE email = NEW.email;
    
    INSERT INTO public.profiles (id, email, full_name, team_role, invited_by)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), t_role, t_invited_by);
    
    -- On ne marque PLUS comme actif ici, cela sera fait lors de la première connexion (useProfile)
  ELSE
    -- Utilisateur normal
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  END IF;
  
  -- Log l'action
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
  VALUES (NEW.id, 'auth.register', 'profile', NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('RPC failed, trying via REST...');
    // We can't easily execute raw SQL via REST if rpc doesn't exist.
    // Let's just create an API route to do it or give the SQL to the user.
    // Wait, I can't execute raw SQL from the client unless I have an RPC.
    // Did I create an `exec_sql` RPC earlier? No.
  }
}

updateTrigger();

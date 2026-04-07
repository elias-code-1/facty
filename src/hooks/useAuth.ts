import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

/** Hook pour gérer la session Supabase */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Récupérer la session initiale
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid_refresh_token')) {
            // Si le refresh token est invalide, on nettoie tout
            await supabase.auth.signOut().catch(() => {});
            if (mounted) {
              setSession(null);
              setUser(null);
            }
            return;
          }
          throw error;
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err: any) {
        console.error('Erreur session initiale:', err.message);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    // Écouter les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}

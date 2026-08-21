import { useContext } from 'react';
import { ProfileContext } from '../contexts/ProfileContext';
import { User } from '@supabase/supabase-js';

/** Hook pour récupérer et gérer le profil utilisateur (délégué au contexte global) */
export function useProfile(user?: User | null) {
  return useContext(ProfileContext);
}

import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase avec les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// On vérifie la présence des variables d'environnement avant d'initialiser le client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erreur: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY est manquant dans les variables d'environnement. " +
    "Veuillez les configurer dans le panneau Secrets de l'AI Studio."
  );
}

// Initialisation du client (sera null ou provoquera une erreur gérée si les variables sont manquantes)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

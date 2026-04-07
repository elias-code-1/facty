import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Utiliser les hooks pour la redirection automatique si déjà connecté
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(session?.user ?? null);

  useEffect(() => {
    if (!authLoading && !profileLoading && session && profile?.role === 'admin') {
      navigate('/admin/facty', { replace: true });
    }
  }, [session, profile, authLoading, profileLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Étape 1 : Connexion
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!data.user) throw new Error('Utilisateur introuvable');

      // Étape 2 : Vérifier le rôle immédiatement
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_suspended')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profil introuvable');

      // Étape 3 : Vérifications
      if (profileData.is_suspended) {
        await supabase.auth.signOut();
        throw new Error('Ce compte est suspendu.');
      }

      if (profileData.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Accès refusé. Ce compte n'a pas les droits administrateur.");
      }

      // Étape 4 : Redirection
      navigate('/admin/facty', { replace: true });

    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message;
        if (msg.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect.');
        } else if (msg.includes('Email not confirmed')) {
          setError('Confirmez votre email avant de continuer.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur est survenue. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl font-bold text-white">Facty</h1>
            <span className="bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5">
              Administration
            </span>
          </div>
          <p className="text-slate-400">Accès réservé aux administrateurs</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@facty.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm flex items-start gap-2">
              <ShieldCheck className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

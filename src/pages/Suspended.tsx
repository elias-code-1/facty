import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function SuspendedPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Compte suspendu</h1>
        <p className="text-slate-600 mb-8">
          Votre compte a été suspendu par un administrateur. Veuillez contacter le support pour plus d'informations.
        </p>
        <button
          onClick={handleLogout}
          className="bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-900 transition-colors"
        >
          Se déconnecter
        </button>
      </motion.div>
    </div>
  );
}

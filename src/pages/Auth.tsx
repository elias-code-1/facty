import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Modal from '../components/ui/Modal';
import { useToast } from '../hooks/useToast';

type AuthMode = 'login' | 'register' | 'email-sent-register' | 'email-sent-reset' | 'email-verified' | 'reset-password';

/** Composant réutilisable pour les champs de saisie */
interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  children?: React.ReactNode;
}

const InputField = ({ label, type, value, onChange, required, placeholder, minLength, children }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5 mb-4">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      minLength={minLength}
      className="border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
    />
    {children}
  </div>
);

/** Page d'authentification Facty */
export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [countdown, setCountdown] = useState(3);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Traduction des erreurs Supabase
  const mapError = (err: any): string => {
    const msg = err.message || '';
    if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect';
    if (msg.includes('Email not confirmed')) return 'Confirmez votre email avant de vous connecter';
    if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet email';
    if (msg.includes('Password should be at least 6 characters')) return 'Le mot de passe doit contenir au moins 8 caractères';
    return 'Une erreur est survenue. Réessayez.';
  };

  // Force du mot de passe
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-slate-200', width: '0%' };
    if (password.length < 8) return { label: 'Faible', color: 'bg-red-500', width: '33%' };
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (password.length >= 8 && hasNumber && hasUpper) return { label: 'Fort', color: 'bg-green-500', width: '100%' };
    return { label: 'Moyen', color: 'bg-orange-500', width: '66%' };
  };

  const strength = getPasswordStrength();

  // Gestion du hash Supabase (Reset Password / Confirmation Email)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const hashParams = new URLSearchParams(hash.substring(1));
    const type = hashParams.get('type') || searchParams.get('type');
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken) return;

    // Établir la session depuis le token
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken ?? ''
    }).then(({ error }) => {
      if (error) {
        console.error('Erreur setSession Auth:', error.message);
        setError('Lien invalide ou expiré.');
        return;
      }

      console.log('Session établie avec succès, type:', type);

      if (type === 'recovery') {
        // Afficher le formulaire reset password
        setMode('reset-password');
      } else if (type === 'signup') {
        // Email confirmé
        setMode('email-verified');
      } else {
        // Par défaut si session établie mais type inconnu
        navigate('/dashboard');
      }

      // Nettoyer le hash de l'URL
      window.history.replaceState(null, '', '/auth');
    });
  }, [navigate, searchParams]);

  // Gestion du cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Vérifier si une session existe déjà ou si l'email est vérifié
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'signup') {
      setMode('email-verified');
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erreur getSession Auth:', error.message);
        if (error.message.includes('Refresh Token Not Found') || error.message.includes('invalid_refresh_token')) {
          supabase.auth.signOut().catch(() => {});
        }
      }
      
      // Ne pas rediriger si on est en train de gérer un lien de récupération ou de confirmation
      const hash = window.location.hash;
      const isRecovery = hash.includes('type=recovery') || searchParams.get('type') === 'recovery' || mode === 'reset-password';
      const isSignup = hash.includes('type=signup') || searchParams.get('type') === 'signup' || mode === 'email-verified';
      
      if (session && !isRecovery && !isSignup) {
        navigate('/dashboard');
      }
    });
  }, [navigate, searchParams, mode]);

  // Countdown pour email-verified
  useEffect(() => {
    if (mode === 'email-verified' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (mode === 'email-verified' && countdown === 0) {
      navigate('/dashboard');
    }
  }, [mode, countdown, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: loginErr } = await supabase.auth.signInWithPassword({ 
          email, 
          password
        });
        
        if (loginErr) throw loginErr;

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        if (data.session) {
          await supabase.from('audit_logs').insert({
            user_id: data.session.user.id,
            action: 'auth.login',
            entity_type: 'profile',
            entity_id: data.session.user.id,
            metadata: { email }
          });
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas.');
        
        const { data: regData, error: regErr } = await supabase.auth.signUp({ email, password });
        if (regErr) throw regErr;
        
        if (regData.user && !regData.session) {
          // Email confirmation required
          setMode('email-sent-register');
          return;
        }

      } else if (mode === 'reset-password') {
        if (password.length < 8) throw new Error('Minimum 8 caractères requis');
        if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas');

        const { error: updateErr } = await supabase.auth.updateUser({
          password: password
        });

        if (updateErr) {
          if (updateErr.message.includes('expired')) {
            throw new Error('Ce lien a expiré. Demandez-en un nouveau.');
          }
          throw updateErr;
        }

        showToast('Mot de passe mis à jour ✓', 'success');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/auth?type=recovery',
      });
      if (resetErr) throw resetErr;
      setIsModalOpen(false);
      setMode('email-sent-reset');
      setCooldown(60);
    } catch (err: any) {
      setError(mapError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      // Logic for resending (Supabase handles this via re-signup or specific methods depending on config)
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  // Rendu des écrans de feedback
  if (mode === 'email-sent-register' || mode === 'email-sent-reset') {
    const isRegister = mode === 'email-sent-register';
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            {isRegister ? <Mail size={32} /> : <Lock size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isRegister ? "Vérifiez votre boîte mail" : "Email envoyé"}
          </h2>
          <p className="text-slate-600 mb-8">
            {isRegister 
              ? `Un lien de confirmation a été envoyé à ${email}.`
              : "Consultez votre boîte mail pour réinitialiser votre mot de passe."}
          </p>
          <button
            onClick={handleResendEmail}
            disabled={cooldown > 0 || loading}
            className="bg-indigo-600 text-white w-full rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 mb-4"
          >
            {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer l'email"}
          </button>
          <button
            onClick={() => setMode('login')}
            className="text-indigo-600 hover:underline text-sm font-medium"
          >
            Retour à la connexion
          </button>
        </motion.div>
      </div>
    );
  }

  if (mode === 'email-verified') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={32} />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Email confirmé ! 🎉</h2>
          <p className="text-slate-600">Redirection dans {countdown}s...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#6366F1] mb-2">Facty</h1>
          <p className="text-slate-500">Gérez vos factures simplement</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
          >
            {mode === 'register' && (
              <InputField label="Nom complet" type="text" value={fullName} onChange={setFullName} required placeholder="Jean Dupont" />
            )}
            
            {mode === 'reset-password' ? (
              <InputField label="Nouveau mot de passe" type="password" value={password} onChange={setPassword} required minLength={8}>
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">Force du mot de passe</span>
                      <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        className={`h-full ${strength.color} transition-all`}
                      />
                    </div>
                  </div>
                )}
              </InputField>
            ) : (
              <InputField label="Email" type="email" value={email} onChange={setEmail} required placeholder="jean@exemple.com" />
            )}
            
            {mode !== 'reset-password' && (
              <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} required minLength={8}>
                {mode === 'register' && password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">Force du mot de passe</span>
                      <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        className={`h-full ${strength.color} transition-all`}
                      />
                    </div>
                  </div>
                )}
              </InputField>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-indigo-600 hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            {(mode === 'register' || mode === 'reset-password') && (
              <InputField label="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-6">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white w-full rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : mode === 'reset-password' ? 'Mettre à jour' : 'Créer un compte'}
            </button>
          </motion.form>
        </AnimatePresence>

        {mode !== 'reset-password' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="text-indigo-600 hover:underline text-sm font-medium"
            >
              {mode === 'login' ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Réinitialiser le mot de passe"
      >
        <form onSubmit={handleResetPassword}>
          <p className="text-slate-600 text-sm mb-6">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
          <InputField
            label="Email"
            type="email"
            value={resetEmail}
            onChange={setResetEmail}
            required
            placeholder="jean@exemple.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white w-full rounded-xl py-3 font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

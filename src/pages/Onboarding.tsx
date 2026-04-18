import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/useToast';
import { 
  User, 
  Building2, 
  Phone, 
  MapPin, 
  Coins, 
  Upload, 
  Loader2, 
  CheckCircle2,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile, uploadLogo } = useProfile(user);
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('FCFA');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!profile || hasRedirected.current) return;

    setFullName(profile.full_name || '');
    setPhone(profile.phone || '');
    setAddress(profile.address || '');
    setCompanyName(profile.company_name || '');
    setCurrency(profile.currency || 'FCFA');

    const isComplete =
      profile.full_name?.trim() &&
      profile.company_name?.trim();

    if (isComplete) {
      hasRedirected.current = true;
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [profile?.id, profile?.full_name, profile?.company_name, navigate]);

  const handleNext = () => {
    if (step === 1 && !fullName) {
      showToast('Veuillez entrer votre nom complet', 'error');
      return;
    }
    if (step === 2 && !companyName) {
      showToast('Veuillez entrer le nom de votre entreprise', 'error');
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        address,
        company_name: companyName,
        currency
      });
      showToast('Configuration terminée ! Bienvenue sur Facty.', 'success');
      // On laisse le useEffect gérer la redirection après le rafraîchissement du profil
    } catch (err) {
      showToast('Une erreur est survenue lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadLogo(file);
      showToast('Logo ajouté avec succès !', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de l\'upload.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
            <CheckCircle2 className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenue sur Facty</h1>
          <p className="text-slate-500 mt-2">Configurons votre compte en quelques secondes</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-200 h-1.5 rounded-full mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-indigo-600 h-full"
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">Qui êtes-vous ?</h2>
                  <p className="text-sm text-slate-500">Ces informations apparaîtront comme émetteur sur vos factures.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Phone size={16} className="text-slate-400" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: +221 77 000 00 00"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      Adresse
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Votre adresse professionnelle"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Continuer
                  <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">Votre entreprise</h2>
                  <p className="text-sm text-slate-500">Dites-nous en plus sur votre activité.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Ma Super Entreprise"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Coins size={16} className="text-slate-400" />
                      Devise par défaut
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                    >
                      <option value="FCFA">FCFA (Franc CFA)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    Continuer
                    <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800">Dernière étape !</h2>
                  <p className="text-sm text-slate-500">Ajoutez votre logo pour des factures professionnelles.</p>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  {profile?.logo_url ? (
                    <div className="relative group">
                      <img
                        src={profile.logo_url}
                        alt="Logo"
                        className="w-32 h-32 object-contain rounded-2xl border border-slate-100 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white"
                      >
                        <Upload size={24} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={32} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajouter</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-4 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : 'Terminer'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          Vous pourrez modifier ces informations plus tard dans les paramètres.
        </p>
      </div>
    </div>
  );
}

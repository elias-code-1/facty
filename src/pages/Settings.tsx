import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/useToast';
import { Upload, Trash2, Image as ImageIcon, Loader2, PlayCircle } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

/** Page des paramètres utilisateur et entreprise */
export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, updateProfile, uploadLogo, deleteLogo } = useProfile(user);
  const { showToast } = useToast();

  const restartTutorial = () => {
    if (user) {
      localStorage.removeItem(`tutorial_seen_${user.id}`);
      showToast('Redirection vers le tableau de bord pour le tutoriel...', 'success');
      // On redirige vers le dashboard car c'est là que commence le tuto
      navigate('/dashboard');
    }
  };

  // États du formulaire
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('FCFA');

  // États de gestion
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialisation des champs
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCompanyName(profile.company_name || '');
      setCurrency(profile.currency || 'FCFA');
    }
  }, [profile]);

  // Vérifier s'il y a des changements
  const hasChanges = profile && (
    fullName !== (profile.full_name || '') ||
    phone !== (profile.phone || '') ||
    address !== (profile.address || '') ||
    companyName !== (profile.company_name || '') ||
    currency !== (profile.currency || 'FCFA')
  );

  const handleSave = async () => {
    if (!hasChanges || saving) return;
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        address,
        company_name: companyName,
        currency
      });
      showToast('Paramètres sauvegardés avec succès !', 'success');
    } catch (err) {
      showToast('Erreur lors de la sauvegarde.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      showToast('Format invalide. PNG ou JPG uniquement.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Fichier trop volumineux (max 2MB).', 'error');
      return;
    }

    setUploading(true);
    try {
      await uploadLogo(file);
      showToast('Logo mis à jour !', 'success');
    } catch (err) {
      showToast('Erreur lors de l\'upload du logo.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer le logo ?')) {
      try {
        await deleteLogo();
        showToast('Logo supprimé.', 'success');
      } catch (err) {
        showToast('Erreur lors de la suppression.', 'error');
      }
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-20">
      {/* NOUVELLE VERSION ANNONCE */}
      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl shadow-sm mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <div>
            <h3 className="text-indigo-800 font-bold text-sm">Ceci est la nouvelle version !</h3>
            <p className="text-indigo-600 text-xs mt-0.5">L'enregistrement de vos paramètres est réparé et pleinement fonctionnel.</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-xs md:text-sm text-slate-500">Gérez vos informations personnelles et celles de votre entreprise</p>
      </div>

      {/* Section 1: Informations personnelles */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Informations personnelles</h2>
          <p className="text-xs md:text-sm text-slate-500">Ces informations apparaissent sur vos factures</p>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-400 cursor-not-allowed outline-none text-sm md:text-base"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Pour changer votre email, contactez le support</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Téléphone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Adresse</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm md:text-base"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Informations entreprise */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Mon entreprise</h2>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Nom de l'entreprise</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Devise</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-sm md:text-base"
              >
                <option value="FCFA">FCFA</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Logo */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Logo de l'entreprise</h2>
          <p className="text-xs md:text-sm text-slate-500">Apparaît en haut de vos factures (PNG, JPG, max 2MB)</p>
        </div>
        <div className="p-4 md:p-6">
          {profile?.logo_url ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <img
                  src={profile.logo_url}
                  alt="Logo entreprise"
                  className="max-h-[100px] md:max-h-[120px] rounded-xl border border-slate-100 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                    <Loader2 className="animate-spin text-indigo-600" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  <ImageIcon size={16} />
                  Changer
                </button>
                <button
                  onClick={handleDeleteLogo}
                  disabled={uploading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
              ) : (
                <Upload className="text-slate-400 w-8 h-8" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  {uploading ? 'Chargement du logo...' : 'Cliquez ou glissez votre logo ici'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG ou JPG jusqu'à 2MB</p>
              </div>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            className="hidden"
          />
        </div>
      </div>

      {/* Section 4: Aide & Tutoriel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Aide & Tutoriel</h2>
          <p className="text-xs md:text-sm text-slate-500">Besoin d'un rappel sur le fonctionnement de Facty ?</p>
        </div>
        <div className="p-4 md:p-6">
          <button
            onClick={restartTutorial}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <PlayCircle size={18} />
            Relancer le tutoriel de bienvenue
          </button>
        </div>
      </div>

      {/* Bouton Sauvegarder */}
      <div className="flex justify-end md:static fixed bottom-0 left-0 right-0 p-4 md:p-0 bg-white md:bg-transparent border-t md:border-none border-slate-100 z-40">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 md:py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
}

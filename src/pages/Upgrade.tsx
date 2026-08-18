import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/useToast';
import { Check, Shield, Star, Zap } from 'lucide-react';
import { useKKiaPay } from 'kkiapay-react';
import { supabase } from '../lib/supabase';
import FullPageSpinner from '../components/ui/FullPageSpinner';
import { motion } from 'framer-motion';

export default function Upgrade() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  useEffect(() => {
    // Si l'utilisateur est déjà premium, on le redirige
    if (profile?.is_premium) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  useEffect(() => {
    async function successHandler(response: any) {
      console.log('KKiaPay Success Response:', response);
      if (response && response.transactionId) {
        setIsVerifying(true);
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;

          if (!token) throw new Error("Vous n'êtes pas authentifié");

          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ transactionId: response.transactionId })
          });

          const data = await verifyRes.json();

          if (!verifyRes.ok) {
            throw new Error(data.error || 'Erreur lors de la vérification');
          }

          showToast('Paiement réussi ! Vous êtes maintenant Premium 🎉', 'success');
          // Forcer le rechargement de l'app pour mettre à jour le profil global
          window.location.href = '/dashboard';
          
        } catch (err: any) {
          showToast(err.message || 'Une erreur est survenue lors de la validation.', 'error');
          setIsVerifying(false);
        }
      }
    }

    function failureHandler(error: any) {
      console.log('KKiaPay Error:', error);
      showToast('Le paiement a échoué ou a été annulé.', 'error');
    }

    addKkiapayListener('success', successHandler);
    addKkiapayListener('failed', failureHandler);

    return () => {
      removeKkiapayListener('success', successHandler);
      removeKkiapayListener('failed', failureHandler);
    };
  }, [addKkiapayListener, removeKkiapayListener, showToast]);

  const handlePayment = () => {
    if (!profile) return;
    
    openKkiapayWidget({
      amount: 2000,
      api_key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
      sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === 'true' || true,
      email: user?.email || '',
      phone: profile.phone || '',
      theme: '#5865F2', // Brand Primary Blue
      name: profile.full_name || 'Utilisateur',
    });
  };

  if (profileLoading || isVerifying) {
    return <FullPageSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-geist font-extrabold text-brand-textDark mb-4">
          Débloquez tout le potentiel de Facty
        </h1>
        <p className="text-lg text-brand-textMuted max-w-2xl mx-auto">
          Passez à la vitesse supérieure. Un seul paiement, un accès à vie à toutes nos fonctionnalités professionnelles.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center bg-brand-white rounded-3xl shadow-xl border border-brand-border overflow-hidden">
        {/* Left side - Pricing */}
        <div className="p-8 md:p-12 flex flex-col h-full bg-brand-lightGray border-r border-brand-border">
          <div className="inline-flex items-center gap-2 bg-brand-goldCertified/10 text-brand-goldCertified rounded-full px-4 py-1.5 text-sm font-semibold w-fit mb-8">
            <Star size={16} className="fill-current" />
            Accès à vie (Lifetime)
          </div>
          
          <div className="mb-2">
            <span className="text-5xl font-geist font-extrabold text-brand-textDark">2000</span>
            <span className="text-xl text-brand-textMuted font-medium ml-2">FCFA</span>
          </div>
          <p className="text-brand-textMuted text-sm mb-8">Paiement unique. Aucun abonnement caché.</p>
          
          <button
            onClick={handlePayment}
            className="w-full bg-brand-bluePrimary hover:bg-brand-bluePrimary/90 text-white font-geist font-bold py-4 rounded-xl shadow-lg shadow-brand-bluePrimary/20 transition-all flex justify-center items-center gap-2"
          >
            <Shield size={20} />
            Payer avec KKiaPay
          </button>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-textMuted">
            <Shield size={14} />
            Paiement 100% sécurisé via KKiaPay
          </div>
        </div>

        {/* Right side - Features */}
        <div className="p-8 md:p-12">
          <h3 className="text-xl font-geist font-bold text-brand-textDark mb-6 flex items-center gap-2">
            <Zap className="text-brand-goldCertified" size={24} />
            Ce qui est inclus
          </h3>
          
          <ul className="space-y-4">
            {[
              "Création illimitée de factures et devis",
              "Base de données clients sans limite",
              "Téléchargement PDF en haute qualité",
              "Suivi détaillé de vos revenus et statistiques",
              "Mises à jour gratuites à vie",
              "Support client prioritaire"
            ].map((feature, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 bg-brand-greenSuccess/10 text-brand-greenSuccess rounded-full p-1">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-brand-textDark font-medium">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

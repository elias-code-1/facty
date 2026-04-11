import React, { useState, useEffect } from 'react';
import * as JoyrideModule from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

// Handle potential default export issues in different environments
const Joyride = (JoyrideModule as any).Joyride || (JoyrideModule as any).default || JoyrideModule;
const STATUS = (JoyrideModule as any).STATUS || (JoyrideModule as any).default?.STATUS || {};
type Step = any; 
type CallBackProps = any;

// Use any for the component to avoid TS issues with react-joyride exports
const JoyrideComponent = Joyride as any;

/**
 * Composant Tooltip personnalisé pour un look moderne
 */
const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  isLastStep,
  size,
}: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 max-w-sm overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-50 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Guide Facty</span>
          </div>
          <button {...skipProps} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title || 'Astuce'}</h3>
          <p className="text-slate-600 leading-relaxed">{step.content}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex gap-1">
            {Array.from({ length: size }).map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-indigo-600' : 'w-1 bg-slate-200'}`} 
              />
            ))}
          </div>

          <div className="flex gap-2">
            {index > 0 && (
              <button
                {...backProps}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              {...primaryProps}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              {isLastStep ? 'C\'est parti !' : 'Suivant'}
              {!isLastStep && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DASHBOARD_STEPS: Step[] = [
  {
    target: '#tour-welcome',
    title: 'Bienvenue !',
    content: 'Voici votre nouveau centre de commande. Tout est pensé pour vous faire gagner du temps.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#tour-stats',
    title: 'Vos chiffres clés',
    content: 'Suivez vos revenus et vos impayés en temps réel. La clarté avant tout.',
    placement: 'bottom',
  },
  {
    target: '#tour-charts',
    title: 'Analyses visuelles',
    content: 'Visualisez la croissance de votre activité grâce à des graphiques dynamiques.',
    placement: 'top',
  },
  {
    target: '#tour-nav-invoices',
    title: 'Facturation éclair',
    content: 'C\'est ici que la magie opère. Créez, envoyez et gérez vos factures en quelques clics.',
    placement: 'right',
  },
  {
    target: '#tour-nav-settings',
    title: 'Personnalisation',
    content: 'N\'oubliez pas de configurer vos informations pour des factures à votre image.',
    placement: 'right',
  }
];

const INVOICES_STEPS: Step[] = [
  {
    target: '#tour-invoice-new',
    title: 'Nouvelle facture',
    content: 'Prêt à être payé ? Créez votre facture ici. On s\'occupe des calculs pour vous.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '#tour-invoice-list',
    title: 'Gestion simplifiée',
    content: 'Filtrez par statut pour savoir exactement qui vous doit quoi.',
    placement: 'top',
  }
];

export default function Tutorial() {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkTutorial = () => {
      const seen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (!seen) {
        setHasSeenTutorial(false);
      }
    };

    checkTutorial();
  }, [user]);

  useEffect(() => {
    // Si l'utilisateur a déjà vu le tuto, on ne le lance pas automatiquement
    // SAUF si on est sur une page spécifique et qu'on veut forcer (via un bouton par ex)
    if (hasSeenTutorial && !run) return;

    if (location.pathname === '/dashboard') {
      setSteps(DASHBOARD_STEPS);
      setRun(true);
    } else if (location.pathname === '/invoices') {
      setSteps(INVOICES_STEPS);
      setRun(true);
    } else {
      setRun(false);
    }
  }, [location.pathname, hasSeenTutorial]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      
      // On marque comme vu définitivement seulement si on finit le dashboard
      if (location.pathname === '/dashboard') {
        localStorage.setItem(`tutorial_seen_${user?.id}`, 'true');
        setHasSeenTutorial(true);
      }
    }
  };

  // Écouter l'événement personnalisé pour relancer le tuto
  useEffect(() => {
    const handleRestart = () => {
      setHasSeenTutorial(false);
      setRun(true);
    };

    window.addEventListener('restart-tutorial', handleRestart);
    return () => window.removeEventListener('restart-tutorial', handleRestart);
  }, []);

  if (!JoyrideComponent || (typeof JoyrideComponent !== 'function' && typeof JoyrideComponent !== 'object')) {
    return null;
  }

  return (
    <JoyrideComponent
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress={false}
      showSkipButton
      steps={steps}
      tooltipComponent={Tooltip}
      floaterProps={{
        disableAnimation: true,
      }}
      styles={{
        options: {
          primaryColor: '#4f46e5',
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.5)',
        },
        spotlight: {
          borderRadius: '24px',
        }
      }}
    />
  );
}

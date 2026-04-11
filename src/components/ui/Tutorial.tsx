import React, { useState, useEffect } from 'react';
import * as JoyrideModule from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Correction de l'import pour react-joyride.
 * Cette bibliothèque a des comportements d'exportation différents entre le dev et le build.
 */
const Joyride = (JoyrideModule as any).Joyride || (JoyrideModule as any).default || JoyrideModule;
const STATUS = (JoyrideModule as any).STATUS || (JoyrideModule as any).default?.STATUS || {};

// On s'assure que JoyrideComponent est bien une fonction/composant et non l'objet module
const JoyrideComponent = typeof Joyride === 'function' ? Joyride : (Joyride.default || Joyride);

type Step = any;
type JoyrideCallBackProps = any;

const DASHBOARD_STEPS: Step[] = [
  {
    target: '#tour-welcome',
    content: 'Bienvenue sur Facty ! Voici votre tableau de bord personnel.',
    placement: 'bottom',
  },
  {
    target: '#tour-stats',
    content: 'Suivez vos performances en un coup d\'œil : factures, revenus et impayés.',
    placement: 'bottom',
  },
  {
    target: '#tour-charts',
    content: 'Visualisez l\'évolution de vos revenus et la répartition de vos statuts.',
    placement: 'top',
  },
  {
    target: '#tour-recent',
    content: 'Retrouvez ici vos dernières activités et accédez rapidement à vos factures.',
    placement: 'top',
  },
  {
    target: '#tour-nav-invoices',
    content: 'Gérez l\'ensemble de vos factures ici.',
    placement: 'right',
  },
  {
    target: '#tour-nav-clients',
    content: 'Enregistrez vos clients pour créer des factures encore plus vite.',
    placement: 'right',
  },
  {
    target: '#tour-nav-settings',
    content: 'Configurez vos informations professionnelles et vos préférences.',
    placement: 'right',
  }
];

const INVOICES_STEPS: Step[] = [
  {
    target: '#tour-invoice-new',
    content: 'Cliquez ici pour créer votre première facture en moins de 30 secondes.',
    placement: 'bottom',
  },
  {
    target: '#tour-invoice-list',
    content: 'Toutes vos factures sont listées ici. Vous pouvez les filtrer par statut.',
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

    const checkTutorial = async () => {
      // On utilise localStorage pour la simplicité, mais on pourrait utiliser Supabase
      const seen = localStorage.getItem(`tutorial_seen_${user.id}`);
      if (!seen) {
        setHasSeenTutorial(false);
        setRun(true);
      }
    };

    checkTutorial();
  }, [user]);

  useEffect(() => {
    if (hasSeenTutorial) return;

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

  const handleJoyrideCallback = (data: JoyrideCallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      if (location.pathname === '/dashboard') {
        // On ne marque comme "vu" que si l'utilisateur finit le tour du dashboard
        // ou on pourrait le faire par page. Ici on fait global.
        // localStorage.setItem(`tutorial_seen_${user?.id}`, 'true');
      }
      
      // Si on veut marquer comme fini après le dashboard
      if (location.pathname === '/dashboard') {
        // localStorage.setItem(`tutorial_seen_${user?.id}`, 'true');
      }
    }
  };

  const finishTutorial = () => {
    if (user) {
      localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
      setHasSeenTutorial(true);
      setRun(false);
    }
  };

  // Sécurité : si le composant n'est pas valide, on ne l'affiche pas pour éviter de crash l'app
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
      showProgress
      showSkipButton
      steps={steps}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer le tuto',
      }}
      styles={{
        options: {
          primaryColor: '#4f46e5',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          borderRadius: '12px',
          fontWeight: 'bold',
        },
        buttonBack: {
          marginRight: '10px',
        }
      } as any}
    />
  );
}

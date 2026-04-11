import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    const isInIframe = window.self !== window.top;

    const handler = (e: Event) => {
      e.preventDefault();
      // Attendre 3 secondes avant d'afficher
      setTimeout(() => {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setIsVisible(true);
      }, 3000);
    };

    // Pour Android/Chrome/Windows
    window.addEventListener('beforeinstallprompt', handler);

    // Pour iOS : on affiche le bouton si on n'est pas déjà en standalone
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    // Si on est dans un iframe, on affiche quand même pour proposer d'ouvrir en plein écran
    if (isInIframe && !isStandalone) {
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    const installedHandler = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', installedHandler);

    // Vérifier si l'app est déjà installée (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      window.open(window.location.href, '_blank');
      return;
    }

    if (isIOS) {
      alert("Pour installer Facty sur iOS :\n1. Cliquez sur le bouton 'Partager' en bas de votre navigateur.\n2. Sélectionnez 'Sur l'écran d'accueil'.");
      return;
    }

    if (!deferredPrompt) return;

    // Afficher l'invite d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    await deferredPrompt.userChoice;

    // On ne peut utiliser l'événement qu'une seule fois
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isInIframe = window.self !== window.top;

  return (
    <div className="fixed bottom-24 right-4 z-[90] animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-indigo-50 p-4 flex items-center gap-4 max-w-sm">
        <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
          <Download size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900">
            {isInIframe ? 'Installer l\'application' : 'Installer Facty'}
          </h4>
          <p className="text-xs text-slate-500">
            {isInIframe 
              ? 'Ouvrez dans un nouvel onglet pour installer.' 
              : 'Accédez à vos factures plus rapidement.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            {isInIframe ? 'Ouvrir' : 'Installer'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

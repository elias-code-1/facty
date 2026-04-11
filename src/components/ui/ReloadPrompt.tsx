import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${offlineReady ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {offlineReady ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">
              {offlineReady ? 'Prêt pour le mode hors ligne' : 'Nouvelle version disponible'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {offlineReady 
                ? 'L\'application est maintenant disponible hors ligne.' 
                : 'Une mise à jour est disponible pour améliorer votre expérience.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => close()}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Fermer
          </button>
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-100"
            >
              Mettre à jour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

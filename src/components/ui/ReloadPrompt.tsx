import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegistered(r) {
      // Auto-check toutes les heures
      if (r) {
        setInterval(() => {
          r.update()
        }, 60 * 60 * 1000)
      }
    },
  });

  if (!offlineReady) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[100] p-4 bg-white rounded-2xl shadow-xl border border-green-100 max-w-xs animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-green-100 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">
            Disponible hors ligne ✓
          </p>
          <p className="text-xs text-slate-500">
            Facty fonctionne sans connexion
          </p>
        </div>
        <button
          onClick={() => setOfflineReady(false)}
          className="text-slate-400 hover:text-slate-600 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}

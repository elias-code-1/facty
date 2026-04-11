import React, { useState, useEffect } from 'react';
import { X, Trash2, EyeOff } from 'lucide-react';

export default function ErrorViewer() {
  const [errors, setErrors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, event.message]);
      setIsVisible(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, String(event.reason)]);
      setIsVisible(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!isVisible || errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full bg-red-50 border border-red-200 rounded-xl shadow-2xl overflow-hidden no-print">
      <div className="bg-red-600 text-white px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="font-bold text-sm">Console Admin ({errors.length})</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setErrors([])} 
            title="Vider la console"
            className="hover:scale-110 transition-transform"
          >
            <Trash2 size={14} />
          </button>
          <button 
            onClick={() => setIsVisible(false)} 
            title="Masquer"
            className="hover:scale-110 transition-transform"
          >
            <EyeOff size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 max-h-60 overflow-y-auto bg-slate-900 select-none">
        {errors.map((err, i) => (
          <div key={i} className="text-[10px] text-red-400 mb-3 pb-3 border-b border-slate-800 last:mb-0 last:pb-0 last:border-0 font-mono break-words leading-relaxed">
            <span className="text-slate-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
            {err}
          </div>
        ))}
      </div>
    </div>
  );
}

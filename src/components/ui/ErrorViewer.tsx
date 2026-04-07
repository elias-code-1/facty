import React, { useState, useEffect } from 'react';

export default function ErrorViewer() {
  const [errors, setErrors] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (import.meta.env.PROD) return;

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
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm w-full bg-red-50 border border-red-200 rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
        <span className="font-bold text-sm">Erreurs ({errors.length})</span>
        <div className="flex gap-2">
          <button onClick={() => setErrors([])} className="text-xs hover:underline">Clear</button>
          <button onClick={() => setIsVisible(false)} className="text-xs hover:underline">Hide</button>
        </div>
      </div>
      <div className="p-4 max-h-60 overflow-y-auto">
        {errors.map((err, i) => (
          <div key={i} className="text-xs text-red-800 mb-2 pb-2 border-b border-red-100 last:mb-0 last:pb-0 last:border-0 font-mono break-words">
            {err}
          </div>
        ))}
      </div>
    </div>
  );
}
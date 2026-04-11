import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

/** Composant de notification Toast */
export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    // Les erreurs durent plus longtemps pour permettre la lecture
    const duration = type === 'error' ? 8000 : 4000;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border max-w-md ${
          isSuccess 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}
      >
        <div className="flex-shrink-0">
          {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>
        
        <div className="flex-grow min-w-0">
          <p className={`text-sm font-medium break-words leading-tight ${!isSuccess ? 'select-none' : ''}`}>{message}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isSuccess ? 'hover:bg-green-100' : 'hover:bg-red-100'
            }`}
          >
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

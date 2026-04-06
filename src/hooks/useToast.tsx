import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '../components/ui/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Provider pour gérer les notifications Toast globalement
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type === 'info' ? 'success' : toast.type} // Fallback info to success for now if component doesn't support it
          onClose={hideToast} 
        />
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook pour utiliser le système de Toast
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

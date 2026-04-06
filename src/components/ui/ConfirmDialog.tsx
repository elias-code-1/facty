import React from 'react';
import Modal from './Modal';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  loading?: boolean;
  disabled?: boolean;
}

/** Modal de confirmation réutilisable */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  confirmVariant = 'primary',
  loading = false,
  disabled = false
}: ConfirmDialogProps) {
  const isDanger = confirmVariant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
          <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || disabled}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            } disabled:opacity-50`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

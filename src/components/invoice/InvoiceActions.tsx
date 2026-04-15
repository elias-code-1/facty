import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  MoreVertical, 
  Trash2, 
  CheckCircle, 
  Send, 
  XCircle, 
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { Invoice } from '../../types/database';
import { useToast } from '../../hooks/useToast';

import { motion, AnimatePresence } from 'framer-motion';

interface InvoiceActionsProps {
  invoice: Invoice;
  onStatusChange: (status: Invoice['status']) => void;
  onDelete: () => void;
  onExportPDF?: () => Promise<void>;
  exportLoading: boolean;
  onPrint?: () => Promise<void>;
  printLoading: boolean;
  isMobile?: boolean;
}

/**
 * Barre d'actions pour la gestion d'une facture (impression, PDF, statut, suppression)
 */
export default function InvoiceActions({ 
  invoice, 
  onStatusChange, 
  onDelete,
  onExportPDF,
  exportLoading,
  onPrint,
  printLoading,
  isMobile = false
}: InvoiceActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex items-center gap-2 md:gap-3 no-print ${isMobile ? 'w-full' : ''}`}>
      {/* Bouton Imprimer */}
      {onPrint && (
        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPrint}
          disabled={printLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm no-print ${
            isMobile ? 'flex-1' : ''
          } ${printLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {printLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full" />
          ) : (
            <Printer size={18} />
          )}
          <span className={isMobile ? 'inline' : 'hidden sm:inline'}>Imprimer</span>
        </motion.button>
      )}

      {/* Bouton Télécharger PDF */}
      {onExportPDF && (
        <motion.button
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.16 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onExportPDF}
          disabled={exportLoading}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 ${
            isMobile ? 'flex-[2]' : ''
          } ${exportLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {exportLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download size={18} />
          )}
          <span className={isMobile ? 'inline' : 'hidden sm:inline'}>PDF</span>
        </motion.button>
      )}

      {/* Dropdown Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.24 }}
        className="relative" 
        ref={dropdownRef}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <MoreVertical size={20} />
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: isMobile ? -8 : 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isMobile ? -8 : 8 }}
              transition={{ duration: 0.2 }}
              className={`absolute right-0 ${
                isMobile ? 'bottom-full mb-2' : 'mt-2'
              } w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden`}
            >
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions de statut</p>
            </div>

            {/* Actions de statut conditionnelles */}
            {invoice.status === 'draft' && (
              <button
                onClick={() => { onStatusChange('sent'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Send size={16} />
                <span>Marquer comme envoyée</span>
              </button>
            )}

            {invoice.status === 'sent' && (
              <>
                <button
                  onClick={() => { onStatusChange('paid'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  <CheckCircle size={16} />
                  <span>Marquer comme payée</span>
                </button>
                <button
                  onClick={() => { onStatusChange('cancelled'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <XCircle size={16} />
                  <span>Annuler la facture</span>
                </button>
              </>
            )}

            {invoice.status === 'cancelled' && (
              <button
                onClick={() => { onStatusChange('draft'); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Remettre en brouillon</span>
              </button>
            )}

            {invoice.status === 'paid' && (
              <div className="px-4 py-2 text-xs text-slate-400 italic">
                Aucune action de statut disponible
              </div>
            )}

            <div className="my-1 border-t border-slate-50" />

            {/* Action de suppression */}
            <button
              onClick={() => { onDelete(); setIsDropdownOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              <span>Supprimer la facture</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
);
}

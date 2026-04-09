import React from 'react';
import { ChevronDown } from 'lucide-react';
import { InvoiceStatus } from '../../types/database';

interface InvoiceStatusSelectProps {
  status: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/** 
 * Liste déroulante stylisée pour le changement de statut d'une facture.
 * Ressemble au badge mais est interactif.
 */
export default function InvoiceStatusSelect({ 
  status, 
  onChange, 
  disabled = false,
  size = 'md' 
}: InvoiceStatusSelectProps) {
  const config = {
    draft: {
      label: 'Brouillon',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      dot: 'bg-slate-400'
    },
    sent: {
      label: 'Envoyée',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      dot: 'bg-blue-500'
    },
    paid: {
      label: 'Payée',
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500'
    },
    cancelled: {
      label: 'Annulée',
      bg: 'bg-red-100',
      text: 'text-red-600',
      dot: 'bg-red-500'
    }
  };

  const currentConfig = config[status] || config.draft;
  const { bg, text, dot } = currentConfig;
  const sizeClasses = size === 'sm' ? 'pl-7 pr-7 py-1 text-[10px]' : 'pl-8 pr-8 py-1.5 text-xs';
  const dotSize = size === 'sm' ? 'w-1 h-1 left-2.5' : 'w-1.5 h-1.5 left-3';
  const iconSize = size === 'sm' ? 10 : 12;
  const iconRight = size === 'sm' ? 'right-2' : 'right-3';

  return (
    <div className="relative inline-block group">
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as InvoiceStatus)}
        disabled={disabled}
        className={`
          appearance-none font-bold uppercase tracking-wider rounded-full cursor-pointer outline-none transition-all border-none
          ${bg} ${text} ${sizeClasses}
          hover:ring-2 hover:ring-indigo-500/20 focus:ring-2 focus:ring-indigo-500/40
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        <option value="draft">Brouillon</option>
        <option value="sent">Envoyée</option>
        <option value="paid">Payée</option>
        <option value="cancelled">Annulée</option>
      </select>
      
      {/* Indicateur visuel (point) */}
      <span className={`absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none ${dot} ${dotSize}`} />
      
      {/* Icône Chevron */}
      <ChevronDown 
        size={iconSize} 
        className={`absolute top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity ${iconRight}`} 
      />
    </div>
  );
}

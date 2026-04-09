import React from 'react';
import { InvoiceStatus } from '../../types/database';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: 'sm' | 'md';
}

/** Badge de statut pour les factures */
export default function InvoiceStatusBadge({ status, size = 'md' }: InvoiceStatusBadgeProps) {
  const config = {
    draft: {
      label: 'Brouillon',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      dot: 'bg-slate-400',
      bgHex: '#f1f5f9',
      textHex: '#475569',
      dotHex: '#94a3b8'
    },
    sent: {
      label: 'Envoyée',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      dot: 'bg-blue-500',
      bgHex: '#dbeafe',
      textHex: '#2563eb',
      dotHex: '#3b82f6'
    },
    paid: {
      label: 'Payée',
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
      bgHex: '#dcfce7',
      textHex: '#15803d',
      dotHex: '#22c55e'
    },
    cancelled: {
      label: 'Annulée',
      bg: 'bg-red-100',
      text: 'text-red-600',
      dot: 'bg-red-500',
      bgHex: '#fee2e2',
      textHex: '#dc2626',
      dotHex: '#ef4444'
    }
  };

  const currentConfig = config[status] || config.draft;
  const { label, bg, text, dot, bgHex, textHex, dotHex } = currentConfig;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${bg} ${text} ${sizeClasses} transition-all duration-300`}
      style={{ backgroundColor: bgHex, color: textHex }}
    >
      <span 
        className={`w-1.5 h-1.5 rounded-full ${dot}`} 
        style={{ backgroundColor: dotHex }}
      />
      {label}
    </span>
  );
}

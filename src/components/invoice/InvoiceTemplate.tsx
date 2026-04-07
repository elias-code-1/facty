import React, { forwardRef } from 'react';
import { Profile } from '../../types/database';
import { InvoiceWithItems } from '../../hooks/useInvoices';
import { formatCurrency, formatDate } from '../../utils/invoice';
import InvoiceStatusBadge from './InvoiceStatusBadge';

interface InvoiceTemplateProps {
  invoice: InvoiceWithItems;
  profile: Profile;
}

/**
 * Template HTML final de la facture pour affichage et impression
 */
const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ invoice, profile }, ref) => {
  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled';
  
  // Extraire les initiales pour le placeholder du logo
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={ref}
        id="invoice-template"
        className="w-full bg-white rounded-2xl shadow-md p-6 md:p-10 font-sans text-slate-800"
        style={{ backgroundColor: '#ffffff', color: '#1e293b' }}
      >
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-10">
          <div className="space-y-4">
            {profile.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.company_name} 
                className="max-h-12 md:max-h-16 max-w-[100px] md:max-w-[128px] object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg md:text-xl font-bold"
                style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
              >
                {getInitials(profile.company_name || profile.full_name || 'Facty')}
              </div>
            )}
            <div className="space-y-1">
              <h2 className="font-bold text-base md:text-lg text-slate-900" style={{ color: '#0f172a' }}>{profile.company_name || profile.full_name}</h2>
              <p className="text-xs md:text-sm text-slate-500 whitespace-pre-line" style={{ color: '#64748b' }}>{profile.address}</p>
              <p className="text-xs md:text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.phone}</p>
              <p className="text-xs md:text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.email}</p>
            </div>
          </div>

          <div className="sm:text-right space-y-2 w-full sm:w-auto">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase" style={{ color: '#1e293b' }}>Facture</h1>
            <div className="space-y-1">
              <p className="text-slate-500 font-medium text-sm md:text-base" style={{ color: '#64748b' }}>N° {invoice.invoice_number}</p>
              <div className="flex sm:justify-end">
                <InvoiceStatusBadge status={invoice.status} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Ligne accent indigo */}
        <div className="w-full h-0.5 bg-indigo-600 my-6 md:my-8" style={{ backgroundColor: '#4f46e5' }} />

        {/* DE / POUR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-10">
          <div>
            <span className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3" style={{ color: '#94a3b8' }}>De :</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm md:text-base" style={{ color: '#1e293b' }}>{profile.full_name}</p>
              <p className="text-xs md:text-sm text-slate-500 whitespace-pre-line" style={{ color: '#64748b' }}>{profile.address}</p>
              <p className="text-xs md:text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.phone}</p>
              <p className="text-xs md:text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.email}</p>
            </div>
          </div>

          <div>
            <span className="block text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-3" style={{ color: '#94a3b8' }}>Pour :</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-sm md:text-base" style={{ color: '#1e293b' }}>{invoice.clients.name}</p>
              <p className="text-xs md:text-sm text-slate-500" style={{ color: '#64748b' }}>{invoice.clients.email}</p>
              <p className="text-xs md:text-sm text-slate-500" style={{ color: '#64748b' }}>{invoice.clients.phone}</p>
              <p className="text-xs md:text-sm text-slate-500 whitespace-pre-line" style={{ color: '#64748b' }}>{invoice.clients.address}</p>
            </div>
          </div>
        </div>

        {/* DATES */}
        <div className="flex flex-wrap gap-6 md:gap-12 py-4 md:py-5 border-y border-slate-100 mb-8" style={{ borderColor: '#f1f5f9' }}>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Date d'émission</span>
            <p className="text-xs md:text-sm font-semibold text-slate-700" style={{ color: '#334155' }}>{formatDate(invoice.issue_date)}</p>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Date d'échéance</span>
            <p className={`text-xs md:text-sm font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`} style={{ color: isOverdue ? '#ef4444' : '#334155' }}>
              {formatDate(invoice.due_date)}
              {isOverdue && <span className="ml-2 text-[10px] md:text-xs font-bold" style={{ color: '#ef4444' }}>⚠️ ÉCHÉANCE DÉPASSÉE</span>}
            </p>
          </div>
        </div>

        {/* TABLEAU DES PRESTATIONS */}
        <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-100" style={{ borderColor: '#f1f5f9' }}>
          <table className="w-full border-collapse min-w-[600px] md:min-w-0">
            <thead>
              <tr className="bg-slate-800 text-white" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                <th className="text-left px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest">Description</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest w-20">Qté</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest w-32">Prix unit.</th>
                <th className="text-right px-4 md:px-6 py-3 md:py-4 text-[10px] font-bold uppercase tracking-widest w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" style={{ borderColor: '#f1f5f9' }}>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'} style={{ backgroundColor: index % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700 font-medium" style={{ color: '#334155' }}>{item.description}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-500 text-right" style={{ color: '#64748b' }}>{item.quantity}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-500 text-right" style={{ color: '#64748b' }}>{formatCurrency(item.unit_price, invoice.currency)}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-900 font-bold text-right" style={{ color: '#0f172a' }}>{formatCurrency(item.total, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION TOTAUX */}
        <div className="flex justify-end mb-10">
          <div className="w-full sm:max-w-[280px] space-y-3">
            <div className="flex justify-between text-xs md:text-sm text-slate-500 px-2" style={{ color: '#64748b' }}>
              <span>Sous-total</span>
              <span className="font-medium text-slate-700" style={{ color: '#334155' }}>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm text-slate-500 px-2" style={{ color: '#64748b' }}>
              <span>TVA ({invoice.tax_rate}%)</span>
              <span className="font-medium text-slate-700" style={{ color: '#334155' }}>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
            <div 
              className="flex justify-between items-center bg-indigo-600 text-white rounded-2xl px-4 md:px-5 py-3 md:py-4 shadow-lg shadow-indigo-100"
              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
            >
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-80">Total</span>
              <span className="text-lg md:text-xl font-black">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* NOTES */}
        {invoice.notes && (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Notes :</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>{invoice.notes}</p>
          </div>
        )}

        {/* PIED DE PAGE */}
        <div className="border-t border-slate-100 pt-8 text-center space-y-2" style={{ borderColor: '#f1f5f9' }}>
          <p className="text-xs font-bold text-slate-800 uppercase tracking-widest" style={{ color: '#1e293b' }}>
            {profile.company_name || profile.full_name}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium" style={{ color: '#94a3b8' }}>
            {profile.address && <span>{profile.address.replace(/\n/g, ' ')}</span>}
            {profile.phone && <span>• {profile.phone}</span>}
            {profile.email && <span>• {profile.email}</span>}
          </div>
          <p className="text-[10px] text-slate-300 pt-2 italic" style={{ color: '#cbd5e1' }}>Merci pour votre confiance ! 🙏</p>
        </div>
      </div>

      {/* Branding Propulsé par Facty */}
      <div className="mt-6 text-center">
        <a
          href={window.location.origin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-300 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
        >
          Propulsé par <span className="font-bold text-slate-400 hover:text-indigo-500 transition-colors">Facty</span>
        </a>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;

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
        className="w-full bg-white p-8 md:p-12 font-sans text-slate-800"
        style={{ backgroundColor: '#ffffff', color: '#1e293b', minHeight: '1120px' }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {profile.logo_url ? (
              <img 
                src={profile.logo_url} 
                alt={profile.company_name} 
                className="max-h-20 max-w-[180px] object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-16 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              >
                {getInitials(profile.company_name || profile.full_name || 'Facty')}
              </div>
            )}
            <div className="mt-4 space-y-1">
              <h2 className="font-bold text-xl text-slate-900" style={{ color: '#0f172a' }}>{profile.company_name || profile.full_name}</h2>
              <p className="text-sm text-slate-500 whitespace-pre-line" style={{ color: '#64748b' }}>{profile.address}</p>
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.phone}</p>
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.email}</p>
            </div>
          </div>

          <div className="text-right">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight uppercase mb-2" style={{ color: '#1e293b' }}>Facture</h1>
            <p className="text-slate-500 font-bold text-lg" style={{ color: '#64748b' }}>N° {invoice.invoice_number}</p>
            <div className="flex justify-end mt-2">
              <InvoiceStatusBadge status={invoice.status} size="md" />
            </div>
          </div>
        </div>

        {/* Ligne accent indigo */}
        <div className="w-full h-1 bg-indigo-600 mb-10" style={{ backgroundColor: '#4f46e5' }} />

        {/* DE / POUR */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>De :</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-lg" style={{ color: '#1e293b' }}>{profile.full_name}</p>
              <p className="text-sm text-slate-500 whitespace-pre-line" style={{ color: '#64748b' }}>{profile.address}</p>
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.phone}</p>
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>{profile.email}</p>
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Pour :</span>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-lg" style={{ color: '#1e293b' }}>{invoice.clients.name}</p>
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>{invoice.clients.email}</p>
              <p className="text-sm text-slate-500" style={{ color: '#64748b' }}>{invoice.clients.phone}</p>
              <p className="text-sm text-slate-500 whitespace-pre-line" style={{ color: '#64748b' }}>{invoice.clients.address}</p>
            </div>
          </div>
        </div>

        {/* DATES */}
        <div className="grid grid-cols-2 gap-12 py-6 border-y border-slate-100 mb-10" style={{ borderColor: '#f1f5f9' }}>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Date d'émission</span>
            <p className="text-base font-bold text-slate-700" style={{ color: '#334155' }}>{formatDate(invoice.issue_date)}</p>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Date d'échéance</span>
            <p className={`text-base font-bold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`} style={{ color: isOverdue ? '#ef4444' : '#334155' }}>
              {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* TABLEAU DES PRESTATIONS */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200" style={{ borderColor: '#e2e8f0' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white" style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest">Description</th>
                <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-widest w-24">Qté</th>
                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest w-40">Prix unit.</th>
                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest w-40">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" style={{ borderColor: '#f1f5f9' }}>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'} style={{ backgroundColor: index % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                  <td className="px-6 py-5 text-sm text-slate-700 font-medium" style={{ color: '#334155' }}>{item.description}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 text-center" style={{ color: '#64748b' }}>{item.quantity}</td>
                  <td className="px-6 py-5 text-sm text-slate-500 text-right" style={{ color: '#64748b' }}>{formatCurrency(item.unit_price, invoice.currency)}</td>
                  <td className="px-6 py-5 text-sm text-slate-900 font-bold text-right" style={{ color: '#0f172a' }}>{formatCurrency(item.total, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION TOTAUX */}
        <div className="flex justify-end mb-12">
          <div className="w-full max-w-[320px] space-y-4">
            <div className="flex justify-between text-sm text-slate-500 px-2" style={{ color: '#64748b' }}>
              <span>Sous-total</span>
              <span className="font-bold text-slate-700" style={{ color: '#334155' }}>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 px-2" style={{ color: '#64748b' }}>
              <span>TVA ({invoice.tax_rate}%)</span>
              <span className="font-bold text-slate-700" style={{ color: '#334155' }}>{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
            </div>
            <div 
              className="flex justify-between items-center bg-indigo-600 text-white rounded-2xl px-6 py-5 shadow-xl shadow-indigo-100"
              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
            >
              <span className="text-xs font-bold uppercase tracking-widest opacity-90">Total</span>
              <span className="text-2xl font-black">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* NOTES */}
        {invoice.notes && (
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 mb-12" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Notes :</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>{invoice.notes}</p>
          </div>
        )}

        {/* PIED DE PAGE */}
        <div className="mt-auto border-t border-slate-100 pt-10 text-center space-y-3" style={{ borderColor: '#f1f5f9' }}>
          <p className="text-sm font-bold text-slate-800 uppercase tracking-widest" style={{ color: '#1e293b' }}>
            {profile.company_name || profile.full_name}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium" style={{ color: '#94a3b8' }}>
            {profile.address && <span>{profile.address.replace(/\n/g, ' ')}</span>}
            {profile.phone && <span>• {profile.phone}</span>}
            {profile.email && <span>• {profile.email}</span>}
          </div>
          <p className="text-xs text-slate-300 pt-4 italic" style={{ color: '#cbd5e1' }}>Merci pour votre confiance ! 🙏</p>
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

import React from 'react';
import { InvoiceFormData, InvoiceItemFormData } from '../../hooks/useInvoices';
import { Client, Profile } from '../../types/database';
import { formatCurrency, formatDate, calculateTotals } from '../../utils/invoice';

interface InvoicePreviewProps {
  formData: InvoiceFormData;
  items: InvoiceItemFormData[];
  client: Client | null;
  profile: Profile;
}

/** Aperçu en temps réel de la facture */
export default function InvoicePreview({ formData, items, client, profile }: InvoicePreviewProps) {
  const { subtotal, tax_amount, total } = calculateTotals(items, formData.tax_rate);

  const statusColors = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-600',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  const statusLabels = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    cancelled: 'Annulée',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[800px] flex flex-col">
      {/* Header Accent */}
      <div className="h-2 bg-indigo-600 w-full"></div>

      <div className="p-8 md:p-12 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="space-y-4">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt="Logo"
                className="max-h-16 object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {profile.company_name?.charAt(0) || profile.full_name?.charAt(0) || 'I'}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">{profile.company_name || profile.full_name}</h3>
              <p className="text-sm text-slate-500 whitespace-pre-line">{profile.address}</p>
              <p className="text-sm text-slate-500">{profile.phone}</p>
            </div>
          </div>

          <div className="text-right space-y-2">
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Facture</h1>
            <div className="space-y-1">
              <p className="text-slate-500 font-medium">N° {formData.invoice_number || '---'}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[formData.status]}`}>
                {statusLabels[formData.status]}
              </span>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Émetteur</p>
            <div className="space-y-1">
              <p className="font-bold text-slate-800">{profile.full_name}</p>
              <p className="text-sm text-slate-600">{profile.email}</p>
              <p className="text-sm text-slate-600">{profile.phone}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client</p>
            {client ? (
              <div className="space-y-1">
                <p className="font-bold text-slate-800">{client.name}</p>
                <p className="text-sm text-slate-600">{client.email}</p>
                <p className="text-sm text-slate-600">{client.phone}</p>
                <p className="text-sm text-slate-600 whitespace-pre-line">{client.address}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Aucun client sélectionné</p>
            )}
          </div>
        </div>

        {/* Dates Section */}
        <div className="flex flex-wrap gap-8 mb-12 border-b border-slate-100 pb-8">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date d'émission</p>
            <p className="font-semibold text-slate-700">{formatDate(formData.issue_date)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date d'échéance</p>
            <p className="font-semibold text-slate-700">{formatDate(formData.due_date)}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest rounded-tl-xl">Description</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-widest w-20">Qté</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest w-32">Prix unit.</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest w-32 rounded-tr-xl">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 text-sm text-slate-700 font-medium">{item.description || '---'}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 text-center">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 text-right">{formatCurrency(item.unit_price, formData.currency)}</td>
                  <td className="px-4 py-4 text-sm text-slate-800 font-bold text-right">{formatCurrency(item.total, formData.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t border-slate-100">
          <div className="flex-1 max-w-md">
            {formData.notes && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes & Conditions</p>
                <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{formData.notes}</p>
              </div>
            )}
          </div>

          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Sous-total</span>
              <span className="text-slate-800 font-bold">{formatCurrency(subtotal, formData.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">TVA ({formData.tax_rate}%)</span>
              <span className="text-slate-800 font-bold">{formatCurrency(tax_amount, formData.currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-slate-800 font-black uppercase tracking-tighter">Total</span>
              <span className="text-2xl font-black text-indigo-600">{formatCurrency(total, formData.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          {profile.company_name || profile.full_name} • {profile.address} • {profile.phone} • {profile.email}
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { Plus, UserPlus, Calendar, Mail, Phone, MapPin, FileText, Percent, Info, Coins, Loader2, RefreshCw, Lock } from 'lucide-react';
import { InvoiceFormData, InvoiceItemFormData } from '../../hooks/useInvoices';
import { Client, Profile } from '../../types/database';
import ItemsTable from './ItemsTable';
import { calculateTotals, formatCurrency, CURRENCIES } from '../../utils/invoice';
import Modal from '../ui/Modal';
import InvoiceStatusSelect from './InvoiceStatusSelect';

interface InvoiceFormProps {
  formData: InvoiceFormData;
  items: InvoiceItemFormData[];
  onChange: (data: Partial<InvoiceFormData>) => void;
  onItemsChange: (items: InvoiceItemFormData[]) => void;
  clients: Client[];
  profile: Profile;
  onNewClient: () => void;
}

/** Formulaire de création de facture */
export default function InvoiceForm({ 
  formData, 
  items, 
  onChange, 
  onItemsChange, 
  clients, 
  profile,
  onNewClient
}: InvoiceFormProps) {
  const { subtotal, tax_amount, total } = calculateTotals(items, formData.tax_rate);
  const selectedClient = clients.find(c => c.id === formData.client_id);

  const setDueDateOffset = (days: number) => {
    const date = new Date(formData.issue_date);
    date.setDate(date.getDate() + days);
    onChange({ due_date: date.toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      {/* Section 1: Client & Devise */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <UserPlus size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Client</h2>
            </div>
            <button
              type="button"
              onClick={onNewClient}
              className="text-xs md:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
            >
              <Plus size={16} />
              Nouveau client
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Sélectionner un client *</label>
              <select
                value={formData.client_id}
                onChange={(e) => onChange({ client_id: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white text-sm md:text-base"
                required
              >
                <option value="">-- Choisir un client --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{selectedClient.email || 'Aucun email'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span>{selectedClient.phone || 'Aucun téléphone'}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-600 sm:col-span-2">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="whitespace-pre-line">{selectedClient.address || 'Aucune adresse'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Coins size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Devise</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Devise de la facture *</label>
            <select
              value={formData.currency}
              onChange={(e) => onChange({ currency: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white font-bold text-slate-700 text-sm md:text-base"
              required
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>{curr.label}</option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              Note: Les montants seront formatés selon cette devise.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Informations facture */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Informations facture</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Numéro de facture *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.invoice_number}
                readOnly
                className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-xl px-4 py-2.5 outline-none cursor-not-allowed font-mono font-bold text-sm md:text-base"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-slate-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Le numéro est généré automatiquement pour garantir la progression.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Statut de la facture</label>
            <div className="flex items-center gap-3">
              <InvoiceStatusSelect 
                status={formData.status} 
                onChange={(status) => onChange({ status })}
              />
              <p className="text-[10px] text-slate-400">
                Définit l'état initial de la facture.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Date d'émission *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => onChange({ issue_date: e.target.value })}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Date d'échéance *</label>
            <div className="space-y-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => onChange({ due_date: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[7, 15, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDueDateOffset(days)}
                    className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] md:text-xs font-semibold rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    +{days} jours
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Lignes de prestation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Plus size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Prestations</h2>
        </div>

        <ItemsTable items={items} onChange={onItemsChange} currency={formData.currency} />
      </div>

      {/* Section 4: Notes & Totaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-2">
            <Info size={18} className="text-indigo-600" />
            Notes & Conditions
          </div>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Conditions de paiement, coordonnées bancaires, remerciements..."
            rows={4}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Sous-total</span>
            <span className="font-bold">{formatCurrency(subtotal, formData.currency)}</span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Percent size={16} className="text-slate-400" />
              <span>TVA (%)</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                value={formData.tax_rate}
                onChange={(e) => onChange({ tax_rate: isNaN(Number(e.target.value)) ? 0 : Number(e.target.value) })}
                className="w-16 md:w-20 border border-slate-200 rounded-lg px-2 md:px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none text-right font-bold text-sm md:text-base"
              />
              <span className="text-sm font-bold text-slate-800 w-20 md:w-24 text-right">
                {formatCurrency(tax_amount, formData.currency)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-base md:text-lg font-black text-slate-800 uppercase tracking-tighter">Total</span>
            <span className="text-xl md:text-2xl font-black text-indigo-600">
              {formatCurrency(total, formData.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

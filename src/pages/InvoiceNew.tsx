import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Send, ChevronLeft, Layout, FileText, UserPlus, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { InvoiceStatus } from '../types/database';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useClients } from '../hooks/useClients';
import { useInvoices, InvoiceFormData, InvoiceItemFormData } from '../hooks/useInvoices';
import { useToast } from '../hooks/useToast';
import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoicePreview from '../components/invoice/InvoicePreview';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { isPremiumActive } from '../utils/premium';

/** Page de création d'une nouvelle facture */
export default function InvoiceNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);
  const { clients, loading: clientsLoading, createClient } = useClients(user);
  const { createInvoice, invoices, checkInvoiceNumberUnique, getNextInvoiceNumber, loading: invoicesLoading } = useInvoices(user);
  const { showToast } = useToast();

  // États UI
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [saving, setSaving] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientLoading, setNewClientLoading] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState<InvoiceFormData>(() => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // +30 jours par défaut

    return {
      client_id: '',
      invoice_number: '',
      status: 'draft',
      currency: 'FCFA',
      issue_date: today.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      notes: '',
      tax_rate: 0,
    };
  });

  // Mettre à jour la devise par défaut quand le profil est chargé
  useEffect(() => {
    if (profile?.currency && formData.currency === 'FCFA') {
      setFormData(prev => ({ ...prev, currency: profile.currency }));
    }
  }, [profile, formData.currency]);

  const [items, setItems] = useState<InvoiceItemFormData[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 }
  ]);

  // État du nouveau client
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Initialisation du numéro de facture
  useEffect(() => {
    const initInvoiceNumber = async () => {
      if (user && formData.invoice_number === '') {
        const nextNumber = await getNextInvoiceNumber();
        setFormData(prev => ({
          ...prev,
          invoice_number: nextNumber
        }));
      }
    };
    initInvoiceNumber();
  }, [user, formData.invoice_number, getNextInvoiceNumber]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === formData.client_id) || null
  , [clients, formData.client_id]);

  const validateForm = (status: InvoiceStatus) => {
    if (status === 'draft') {
      if (!formData.invoice_number) return 'Le numéro de facture est requis.';
      if (!formData.client_id) return 'Veuillez sélectionner un client pour enregistrer le brouillon.';
      return null;
    }

    if (!formData.client_id) return 'Veuillez sélectionner un client.';
    if (!formData.due_date) return 'Veuillez renseigner une date d\'échéance.';
    if (items.length === 0) return 'Veuillez ajouter au moins une ligne de prestation.';
    if (items.some(item => !item.description.trim())) return 'Toutes les lignes doivent avoir une description.';
    if (items.some(item => item.quantity <= 0)) return 'Toutes les quantités doivent être supérieures à 0.';
    if (items.some(item => item.unit_price < 0)) return 'Les prix unitaires ne peuvent pas être négatifs.';
    return null;
  };

  const handleSave = async (status: InvoiceStatus) => {
    const error = validateForm(status);
    if (error) {
      showToast(error, 'error');
      setActiveTab('form');
      return;
    }

    setSaving(true);
    try {
      const filteredItems = items.filter(item => item.description.trim() !== '');

      const invoiceId = await createInvoice({ ...formData, status }, filteredItems);
      showToast(status === 'draft' ? 'Brouillon enregistré !' : 'Facture créée avec succès !', 'success');
      
      setTimeout(() => {
        if (status === 'draft') {
          navigate('/invoices');
        } else {
          navigate(`/invoices/${invoiceId}`);
        }
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la création de la facture.';
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const isClientLimitReached = !isPremiumActive(profile) && profile?.role !== 'admin' && clients.length >= 10;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name.trim()) return;

    if (isClientLimitReached) {
      showToast('Limite de clients atteinte pour la version gratuite.', 'error');
      return;
    }

    setNewClientLoading(true);
    try {
      const newClient = await createClient(newClientData);
      showToast('Client créé avec succès !', 'success');
      setIsNewClientModalOpen(false);
      setNewClientData({ name: '', email: '', phone: '', address: '' });
      if (newClient) {
        setFormData(prev => ({ ...prev, client_id: newClient.id }));
      }
    } catch (err) {
      showToast('Erreur lors de la création du client.', 'error');
    } finally {
      setNewClientLoading(false);
    }
  };

  if (profileLoading || clientsLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) return null;

  // Calcul des limites pour l'utilisateur
  const isPremium = isPremiumActive(profile) || profile.role === 'admin';
  const currentMonthInvoices = invoices.filter(inv => {
    const dateStr = inv.created_at || inv.issue_date;
    if (!dateStr) return false;
    const invDate = new Date(dateStr);
    const now = new Date();
    return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
  });
  
  const isInvoiceLimitReached = !isPremium && currentMonthInvoices.length >= 3;

  if (isInvoiceLimitReached) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 flex flex-col items-center">
          <div className="w-20 h-20 bg-brand-goldCertified/10 rounded-full flex items-center justify-center mb-6">
            <Shield className="text-brand-goldCertified w-10 h-10" />
          </div>
          <h2 className="text-2xl font-geist font-extrabold text-brand-textDark mb-4">Limite mensuelle atteinte</h2>
          <p className="text-brand-textMuted mb-8 text-lg">
            Vous avez atteint votre limite de 3 factures pour ce mois-ci sur le plan gratuit.
            Passez à la version Premium pour créer des factures en illimité et développer votre activité sans contrainte.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="bg-brand-bluePrimary hover:bg-brand-bluePrimary/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand-bluePrimary/20 transition-all"
          >
            Débloquer l'accès illimité
          </button>
          <button
            onClick={() => navigate('/invoices')}
            className="mt-4 text-slate-500 hover:text-slate-700 font-medium"
          >
            Retour aux factures
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800">Nouvelle facture</h1>
            <p className="text-xs md:text-sm text-slate-500">Créez et envoyez une facture professionnelle</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            <span>Sauvegarder brouillon</span>
          </button>
          <button
            onClick={() => handleSave(formData.status === 'draft' ? 'sent' : formData.status)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            <span>{formData.status === 'draft' ? 'Finaliser & Envoyer' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Fixed Action Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-40 flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl active:bg-slate-100 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          <span>Brouillon</span>
        </button>
        <button
          onClick={() => handleSave(formData.status === 'draft' ? 'sent' : formData.status)}
          disabled={saving}
          className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl active:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          <span>{formData.status === 'draft' ? 'Finaliser' : 'Enregistrer'}</span>
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex border-b border-slate-200 mb-6 sticky top-14 bg-slate-50/80 backdrop-blur-md z-30 -mx-4 px-4">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 text-sm font-bold transition-all relative ${
            activeTab === 'form' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Layout size={18} />
            Formulaire
          </div>
          {activeTab === 'form' && (
            <motion.div layout className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-3 text-sm font-bold transition-all relative ${
            activeTab === 'preview' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText size={18} />
            Aperçu
          </div>
          {activeTab === 'preview' && (
            <motion.div layout className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pb-24 md:pb-0">
        {/* Form Column */}
        <div className={`${activeTab === 'form' ? 'block' : 'hidden'} lg:block lg:col-span-7`}>
          <InvoiceForm
            formData={formData}
            items={items}
            onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
            onItemsChange={setItems}
            clients={clients}
            profile={profile}
            onNewClient={() => setIsNewClientModalOpen(true)}
          />
        </div>

        {/* Preview Column */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} lg:block lg:col-span-5 sticky top-24 h-fit`}>
          <div className="hidden lg:block mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aperçu en temps réel</h3>
          </div>
          <InvoicePreview
            formData={formData}
            items={items}
            client={selectedClient}
            profile={profile}
          />
        </div>
      </div>

      {/* Modal Nouveau Client */}
      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Nouveau client"
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nom complet *</label>
            <input
              type="text"
              value={newClientData.name}
              onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
              required
              minLength={2}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={newClientData.email}
              onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Téléphone</label>
            <input
              type="text"
              value={newClientData.phone}
              onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Adresse</label>
            <textarea
              value={newClientData.address}
              onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsNewClientModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <span>Annuler</span>
            </button>
            <button
              type="submit"
              disabled={newClientLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {newClientLoading && <Loader2 size={18} className="animate-spin" />}
              <span>Créer le client</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Pencil, 
  Trash2, 
  FileText, 
  UserPlus, 
  Loader2, 
  X,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useClients, ClientWithCount } from '../hooks/useClients';
import { useToast } from '../hooks/useToast';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 }
};

/** Page de gestion des clients */
export default function Clients() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const navigate = useNavigate();
  const { clients, loading, createClient, updateClient, deleteClient } = useClients(user);
  const { showToast } = useToast();

  // États UI
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientWithCount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const isPremium = profile?.is_premium || profile?.role === 'admin';
  const isClientLimitReached = !isPremium && clients.length >= 10;

  // Filtrage des clients
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const query = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      (c.email?.toLowerCase().includes(query)) ||
      (c.phone?.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  // Ouvrir le modal pour ajout ou modification
  const handleOpenModal = (client?: ClientWithCount) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || ''
      });
      setIsModalOpen(true);
    } else {
      if (isClientLimitReached) {
        showToast('Limite de 10 clients atteinte. Passez à la version Premium.', 'error');
        return;
      }
      setSelectedClient(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
      setIsModalOpen(true);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setActionLoading(true);
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, formData);
        showToast('Client mis à jour avec succès !', 'success');
      } else {
        if (isClientLimitReached) {
           throw new Error('Vous avez atteint la limite de clients.');
        }
        await createClient(formData);
        showToast('Client créé avec succès !', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Une erreur est survenue.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Suppression d'un client
  const handleDelete = async () => {
    if (!selectedClient) return;
    setActionLoading(true);
    try {
      await deleteClient(selectedClient.id);
      showToast('Client supprimé avec succès !', 'success');
      setIsConfirmOpen(false);
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800">Clients</h1>
          <p className="text-sm md:text-base text-slate-500">Gérez votre carnet d'adresses</p>
        </div>
        <button
          id="tour-client-new"
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          <span className="truncate">Nouveau client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8" id="tour-client-search">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm md:text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Clients Grid */}
      <div id="tour-client-list">
        {filteredClients.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all duration-200"
                >
                  {/* Actions (visible on hover on desktop, always on mobile) */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(client)}
                      className="p-2 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setIsConfirmOpen(true);
                      }}
                      className="p-2 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {getInitials(client.name)}
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <h3 className="font-semibold text-slate-800 truncate">{client.name}</h3>
                      <div className="mt-2 space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone size={14} className="flex-shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium">
                      <FileText size={12} />
                      {client.invoices?.[0]?.count || 0} facture{ (client.invoices?.[0]?.count || 0) > 1 ? 's' : '' }
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Ajouté le {new Date(client.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            {searchQuery ? (
              <div className="text-center">
                <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Aucun résultat</h3>
                <p className="text-slate-500">Aucun client ne correspond à "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-indigo-600 font-medium hover:underline"
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-indigo-50 p-6 rounded-full inline-block mb-6">
                  <UserPlus size={48} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun client pour l'instant</h3>
                <p className="text-slate-500 mb-8 max-w-sm">
                  Commencez par ajouter votre premier client pour pouvoir créer des factures.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Ajouter votre premier client
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Formulaire Client */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? `Modifier ${selectedClient.name}` : 'Nouveau client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Nom complet *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={2}
                placeholder="Ex: Jean Dupont"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jean.dupont@email.com"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 00 00 00 00"
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 rue de la Paix, 75000 Paris"
                rows={3}
                className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={18} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog Suppression */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedClient(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer ce client ?"
        message={
          (selectedClient?.invoices?.[0]?.count || 0) > 0
            ? `Ce client a ${selectedClient?.invoices?.[0]?.count} facture${(selectedClient?.invoices?.[0]?.count || 0) > 1 ? 's' : ''}. Vous ne pourrez pas le supprimer tant qu'elles existent.`
            : "Cette action est irréversible. Les factures associées ne seront pas supprimées."
        }
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={actionLoading}
        disabled={(selectedClient?.invoices?.[0]?.count || 0) > 0}
      />
    </div>
  );
}

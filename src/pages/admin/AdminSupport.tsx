import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Search, 
  Mail, 
  CheckCircle, 
  Eye, 
  Clock,
  ExternalLink,
  X,
  Inbox,
  Check
} from 'lucide-react';
import { useSupport, SupportTicket } from '../../hooks/useSupport';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

export default function AdminSupport() {
  const { tickets, loading, updateStatus, refetch } = useSupport(true);
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'read' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesTab = activeTab === 'all' || ticket.status === activeTab;
      const matchesSearch = 
        ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ticket.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [tickets, activeTab, searchQuery]);

  const stats = useMemo(() => {
    return {
      open: tickets.filter(t => t.status === 'open').length,
      read: tickets.filter(t => t.status === 'read').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
    };
  }, [tickets]);

  const handleViewTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    if (ticket.status === 'open') {
      try {
        await updateStatus(ticket.id, 'read');
      } catch (error) {
        console.error('Failed to mark as read');
      }
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await updateStatus(id, 'resolved');
      showToast('Ticket marqué comme résolu', 'success');
      if (selectedTicket?.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await updateStatus(id, 'read');
      showToast('Ticket marqué comme lu', 'success');
    } catch (error) {
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support client</h1>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              En direct
            </div>
          </div>
          <p className="text-slate-500 mt-1">{tickets.length} tickets au total</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
            <Inbox size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Ouverts</p>
            <p className="text-2xl font-bold text-slate-900">{stats.open}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Lus</p>
            <p className="text-2xl font-bold text-slate-900">{stats.read}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Résolus</p>
            <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex p-1 bg-slate-50 rounded-xl overflow-x-auto hide-scrollbar">
          {(['all', 'open', 'read', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'all' ? 'Tous' : tab === 'open' ? 'Ouverts' : tab === 'read' ? 'Lus' : 'Résolus'}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Rechercher un nom, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
          />
        </div>
      </div>

      {/* Liste des Tickets */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <motion.div 
              key={ticket.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={ticket.status} />
                    <h3 className="font-bold text-slate-800">{ticket.subject}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-semibold text-slate-700">{ticket.name}</span>
                    <span>—</span>
                    <span className="font-mono text-xs">{ticket.email}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 italic">
                    "{ticket.message}"
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-start">
                  <button 
                    onClick={() => handleViewTicket(ticket)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Voir"
                  >
                    <Eye size={20} />
                  </button>
                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => handleMarkRead(ticket.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Marquer lu"
                    >
                      <Check size={20} />
                    </button>
                  )}
                  {ticket.status !== 'resolved' && (
                    <button 
                      onClick={() => handleResolve(ticket.id)}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Résoudre"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-green-800">🎉 Aucun ticket en attente !</h3>
            <p className="text-green-600 mt-1">Tout est sous contrôle.</p>
          </div>
        )}
      </div>

      {/* Modal Détail Ticket */}
      <AnimatePresence>
        {selectedTicket && (
          <Modal 
            isOpen={!!selectedTicket} 
            onClose={() => setSelectedTicket(null)}
            title={`Message de ${selectedTicket.name}`}
          >
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">De :</span>
                  <span className="font-semibold text-slate-800">{selectedTicket.name} &lt;{selectedTicket.email}&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sujet :</span>
                  <span className="font-semibold text-slate-800">{selectedTicket.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date :</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedTicket.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Statut :</span>
                  <StatusBadge status={selectedTicket.status} />
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-inner min-h-[150px]">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.message}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <a 
                  href={`mailto:${selectedTicket.email}?subject=Re: ${selectedTicket.subject}`}
                  className="flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
                >
                  <Mail size={18} />
                  Répondre par email
                  <ExternalLink size={14} />
                </a>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Fermer
                  </button>
                  {selectedTicket.status !== 'resolved' && (
                    <button 
                      onClick={() => handleResolve(selectedTicket.id)}
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-100"
                    >
                      Marquer comme résolu
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: SupportTicket['status'] }) {
  const configs = {
    open: { label: 'Ouvert', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    read: { label: 'Lu', color: 'bg-blue-100 text-blue-600 border-blue-200' },
    resolved: { label: 'Résolu', color: 'bg-green-100 text-green-600 border-green-200' },
  };

  const config = configs[status];

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${config.color}`}>
      {config.label}
    </span>
  );
}

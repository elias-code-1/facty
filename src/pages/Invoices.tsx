import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  MoreVertical, 
  Eye, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useInvoices } from '../hooks/useInvoices';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatDate, generateCSV } from '../utils/invoice';
import InvoiceStatusBadge from '../components/invoice/InvoiceStatusBadge';
import InvoiceStatusSelect from '../components/invoice/InvoiceStatusSelect';
import InvoiceFilters from '../components/invoice/InvoiceFilters';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import { InvoiceStatus } from '../types/database';

const rowVariants = {
  initial: { opacity: 0, x: -8 },
  animate: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.04 }
  })
};

/** Page de liste des factures */
export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { invoices, loading, updateStatus, deleteInvoice } = useInvoices(user);
  const { showToast } = useToast();

  // États UI
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Statistiques
  const stats = useMemo(() => {
    const totalCount = invoices.length;
    const draftCount = invoices.filter(i => i.status === 'draft').length;
    
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const paidCount = paidInvoices.length;
    const paidTotal = paidInvoices.reduce((acc, i) => acc + i.total, 0);
    
    const pendingInvoices = invoices.filter(i => i.status === 'sent');
    const pendingCount = pendingInvoices.length;
    const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.total, 0);

    return { totalCount, draftCount, paidCount, paidTotal, pendingCount, pendingTotal };
  }, [invoices]);

  // Filtrage
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesStatus = activeStatus ? inv.status === activeStatus : true;
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        inv.invoice_number.toLowerCase().includes(query) ||
        inv.clients?.name?.toLowerCase().includes(query) ||
        inv.clients?.email?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, activeStatus, searchTerm]);

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Actions
  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    setActionLoading(true);
    try {
      await updateStatus(id, newStatus);
      showToast(`Statut mis à jour → ${newStatus}`, 'success');
      setOpenMenuId(null);
    } catch (err) {
      console.error('Erreur UI handleStatusChange:', err);
      showToast('Erreur lors de la mise à jour.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    setActionLoading(true);
    try {
      await deleteInvoice(selectedInvoice.id);
      showToast('Facture supprimée avec succès !', 'success');
      setIsConfirmOpen(false);
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-slate-800">Mes factures</h1>
          <p className="text-sm md:text-base text-slate-500">{stats.totalCount} facture{stats.totalCount > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => generateCSV(filteredInvoices)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} />
            <span className="truncate">Exporter CSV</span>
          </button>
          <button
            id="tour-invoice-new"
            onClick={() => navigate('/invoices/new')}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span className="truncate">Nouvelle facture</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
          <div className="p-2 bg-slate-50 text-slate-500 rounded-lg w-fit mb-3 md:mb-4">
            <FileText size={18} className="md:w-5 md:h-5" />
          </div>
          <p className="text-lg md:text-2xl font-bold text-slate-800">{stats.totalCount}</p>
          <p className="text-[10px] md:text-sm text-slate-500">Total factures</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
          <div className="p-2 bg-slate-50 text-slate-400 rounded-lg w-fit mb-3 md:mb-4">
            <Clock size={18} className="md:w-5 md:h-5" />
          </div>
          <p className="text-lg md:text-2xl font-bold text-slate-800">{stats.draftCount}</p>
          <p className="text-[10px] md:text-sm text-slate-500">Brouillons</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
          <div className="p-2 bg-green-50 text-green-500 rounded-lg w-fit mb-3 md:mb-4">
            <CheckCircle2 size={18} className="md:w-5 md:h-5" />
          </div>
          <p className="text-lg md:text-2xl font-bold text-slate-800 truncate" title={formatCurrency(stats.paidTotal, profile?.currency || 'FCFA')}>
            {formatCurrency(stats.paidTotal, profile?.currency || 'FCFA')}
          </p>
          <p className="text-[10px] md:text-sm text-slate-500">{stats.paidCount} payée{stats.paidCount > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5">
          <div className="p-2 bg-blue-50 text-blue-500 rounded-lg w-fit mb-3 md:mb-4">
            <RefreshCw size={18} className="md:w-5 md:h-5 animate-spin-slow" />
          </div>
          <p className="text-lg md:text-2xl font-bold text-slate-800 truncate" title={formatCurrency(stats.pendingTotal, profile?.currency || 'FCFA')}>
            {formatCurrency(stats.pendingTotal, profile?.currency || 'FCFA')}
          </p>
          <p className="text-[10px] md:text-sm text-slate-500">{stats.pendingCount} en attente</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <InvoiceFilters
          activeStatus={activeStatus}
          onStatusChange={(s) => { setActiveStatus(s); setCurrentPage(1); }}
          searchTerm={searchTerm}
          onSearchChange={(t) => { setSearchTerm(t); setCurrentPage(1); }}
          totalCount={invoices.length}
          filteredCount={filteredInvoices.length}
        />
      </div>

      {/* Table / Card View */}
      <div id="tour-invoice-list" className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <>
            {/* Table View (Tablet/Desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-left">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">N° Facture</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Émission</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Échéance</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Montant</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  <motion.tbody
                    key={activeStatus ?? 'all'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="divide-y divide-slate-50"
                  >
                    {paginatedInvoices.map((inv, index) => {
                      const overdue = isOverdue(inv.due_date, inv.status);
                      const isLocked = inv.status === 'paid' || inv.status === 'cancelled';
                      
                      return (
                        <motion.tr
                          key={inv.id}
                          variants={rowVariants}
                          initial="initial"
                          animate="animate"
                          custom={index}
                          className={`group hover:bg-slate-50/80 transition-colors ${overdue ? 'bg-red-50/20' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-slate-700">{inv.invoice_number}</span>
                              {isLocked && (
                                <div className="p-1 bg-slate-100 text-slate-400 rounded-md" title="Facture verrouillée">
                                  <Lock size={12} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{inv.clients?.name || '---'}</span>
                              <span className="text-xs text-slate-400 truncate max-w-[150px] hidden lg:inline">{inv.clients?.email || '---'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">
                            {formatDate(inv.issue_date)}
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                              {overdue && <AlertTriangle size={14} />}
                              {formatDate(inv.due_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {formatCurrency(inv.total, profile?.currency || 'FCFA')}
                          </td>
                          <td className="px-6 py-4">
                            <InvoiceStatusSelect 
                              status={inv.status} 
                              onChange={(newStatus) => handleStatusChange(inv.id, newStatus)}
                              disabled={actionLoading || isLocked}
                            />
                          </td>
                          <td className="px-6 py-4 text-right relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === inv.id ? null : inv.id)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Menu */}
                            {openMenuId === inv.id && (
                              <div 
                                ref={menuRef}
                                className="absolute right-6 top-12 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-10 py-2 text-left"
                              >
                                <button
                                  onClick={() => navigate(`/invoices/${inv.id}`)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye size={16} />
                                  Voir
                                </button>
                                
                                {!isLocked && (
                                  <button
                                    onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                  >
                                    <Pencil size={16} />
                                    Modifier
                                  </button>
                                )}
                                
                                <div className="h-px bg-slate-50 my-1" />
                                
                                <p className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Changer statut</p>
                                {inv.status === 'draft' && (
                                  <>
                                    <button onClick={() => handleStatusChange(inv.id, 'sent')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors">Envoyer</button>
                                    <button onClick={() => handleStatusChange(inv.id, 'cancelled')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Annuler</button>
                                  </>
                                )}
                                {inv.status === 'sent' && (
                                  <>
                                    <button onClick={() => handleStatusChange(inv.id, 'paid')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors">Marquer payée</button>
                                    <button onClick={() => handleStatusChange(inv.id, 'cancelled')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Annuler</button>
                                  </>
                                )}
                                
                                <div className="h-px bg-slate-50 my-1" />
                                
                                {!isLocked && (
                                  <button
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setIsConfirmOpen(true);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                    Supprimer
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>

            {/* Card View (Mobile) */}
            <div className="md:hidden divide-y divide-slate-50">
              {paginatedInvoices.map((inv) => (
                <div 
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="p-4 active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-bold text-slate-700">{inv.invoice_number}</span>
                    <InvoiceStatusBadge status={inv.status} size="sm" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 truncate">{inv.clients?.name || '---'}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(inv.total, profile?.currency || 'FCFA')}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(inv.issue_date)}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <Search size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {searchTerm || activeStatus ? 'Aucun résultat' : 'Aucune facture pour l\'instant'}
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm text-center">
              {searchTerm || activeStatus 
                ? 'Aucune facture ne correspond à vos critères de recherche.' 
                : 'Commencez par créer votre première facture professionnelle.'}
            </p>
            {searchTerm || activeStatus ? (
              <button
                onClick={() => { setSearchTerm(''); setActiveStatus(null); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <button
                onClick={() => navigate('/invoices/new')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Créer votre première facture
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-500 hover:bg-white hover:border-slate-200 border border-transparent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog Suppression */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer cette facture ?"
        message={`Voulez-vous vraiment supprimer la facture ${selectedInvoice?.invoice_number} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
}

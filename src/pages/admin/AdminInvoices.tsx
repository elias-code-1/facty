import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Eye, 
  User, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminInvoices, AdminInvoice } from '../../hooks/useAdminInvoices';
import InvoiceStatusBadge from '../../components/invoice/InvoiceStatusBadge';
import { formatDate, formatCurrency } from '../../utils/format';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import FullPageSpinner from '../../components/ui/FullPageSpinner';

type InvoiceStatus = 'all' | 'draft' | 'sent' | 'paid' | 'canceled';
type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year';

const ITEMS_PER_PAGE = 20;

/** Page de gestion globale des factures pour l'administrateur */
export default function AdminInvoices() {
  const navigate = useNavigate();
  const { invoices, loading, deleteInvoice } = useAdminInvoices();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  const [confirmDelete, setConfirmDelete] = useState<AdminInvoice | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Liste des propriétaires uniques pour le filtre
  const owners = useMemo(() => {
    const uniqueOwners = new Map<string, { id: string; full_name: string }>();
    invoices.forEach(inv => {
      if (inv.owner) {
        uniqueOwners.set(inv.owner.id, { id: inv.owner.id, full_name: inv.owner.full_name });
      }
    });
    return Array.from(uniqueOwners.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [invoices]);

  // Filtrage des factures
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Recherche (N°, client, owner)
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        inv.invoice_number.toLowerCase().includes(searchLower) ||
        (inv.client?.name || '').toLowerCase().includes(searchLower) ||
        (inv.owner?.full_name || '').toLowerCase().includes(searchLower);
      
      // 2. Statut
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      // 3. Utilisateur
      const matchesUser = userFilter === 'all' || inv.user_id === userFilter;
      
      // 4. Période
      let matchesPeriod = true;
      if (periodFilter !== 'all') {
        const date = new Date(inv.created_at);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (periodFilter === 'today') {
          matchesPeriod = date >= startOfDay;
        } else if (periodFilter === 'week') {
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          matchesPeriod = date >= startOfWeek;
        } else if (periodFilter === 'month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          matchesPeriod = date >= startOfMonth;
        } else if (periodFilter === 'year') {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          matchesPeriod = date >= startOfYear;
        }
      }
      
      return matchesSearch && matchesStatus && matchesUser && matchesPeriod;
    });
  }, [invoices, search, statusFilter, userFilter, periodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats rapides (sur toutes les factures)
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return {
      total: invoices.length,
      revenue: invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.total || 0), 0),
      pending: invoices
        .filter(i => i.status === 'sent')
        .reduce((sum, i) => sum + (i.total || 0), 0),
      thisMonth: invoices.filter(i => new Date(i.created_at) >= startOfMonth).length
    };
  }, [invoices]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteInvoice(confirmDelete.id);
      setToast({ message: "Facture supprimée avec succès.", type: 'success' });
    } catch (err) {
      setToast({ message: "Erreur lors de la suppression.", type: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Export CSV global
  const handleExportCSV = () => {
    if (invoices.length === 0) return;

    const headers = [
      "N° Facture", "Propriétaire", "Email propriétaire", 
      "Client", "Email client", "Date émission", "Échéance", 
      "Sous-total", "TVA(%)", "Montant TVA", "Total", 
      "Statut", "Devise"
    ];

    const rows = invoices.map(inv => [
      inv.invoice_number,
      inv.owner?.full_name || '-',
      inv.owner?.email || '-',
      inv.client?.name || 'Client supprimé',
      inv.client?.email || '-',
      inv.created_at.split('T')[0],
      inv.due_date || '-',
      inv.subtotal,
      inv.tax_rate,
      inv.tax_amount,
      inv.total,
      inv.status,
      inv.currency
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `facty-admin-factures-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Toutes les factures</h1>
          <p className="text-slate-500 mt-1">{invoices.length} factures sur la plateforme.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={invoices.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs font-medium text-slate-500">Total factures</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.revenue, 'FCFA')}</p>
          <p className="text-xs font-medium text-slate-500">Revenus totaux</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.pending, 'FCFA')}</p>
          <p className="text-xs font-medium text-slate-500">En attente</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.thisMonth}</p>
          <p className="text-xs font-medium text-slate-500">Ce mois</p>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par N°, client ou propriétaire..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          {/* Filtre statut */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <div className="flex p-1 bg-slate-50 rounded-xl">
              {(['all', 'draft', 'sent', 'paid', 'canceled'] as InvoiceStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === s 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s === 'all' ? 'Toutes' : s === 'draft' ? 'Brouillon' : s === 'sent' ? 'Envoyées' : s === 'paid' ? 'Payées' : 'Annulées'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          {/* Filtre par utilisateur */}
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">Tous les utilisateurs</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.full_name}</option>
              ))}
            </select>
          </div>

          {/* Filtre par période */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={periodFilter}
              onChange={(e) => { setPeriodFilter(e.target.value as PeriodFilter); setCurrentPage(1); }}
              className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">Toute la période</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="py-4 pl-6">N°</th>
                <th className="py-4">Propriétaire</th>
                <th className="py-4">Client</th>
                <th className="py-4">Date</th>
                <th className="py-4">Montant</th>
                <th className="py-4">Statut</th>
                <th className="py-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {paginatedInvoices.map((inv) => (
                  <motion.tr 
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="py-4 pl-6">
                      <span className="text-sm font-mono font-bold text-slate-800">{inv.invoice_number}</span>
                    </td>
                    <td className="py-4">
                      <div 
                        className="flex flex-col min-w-0 hover:text-indigo-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inv.owner) navigate(`/admin/facty/users/${inv.owner.id}`);
                        }}
                      >
                        <span className="text-sm font-bold text-slate-800 truncate">{inv.owner?.full_name || 'Inconnu'}</span>
                        <span className="text-[10px] text-slate-400 truncate">{inv.owner?.email || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      {inv.client ? (
                        <span className="text-sm font-medium text-slate-600">{inv.client.name}</span>
                      ) : (
                        <span className="text-sm font-medium text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Client supprimé
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-500">{formatDate(inv.created_at)}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-bold text-slate-800">{formatCurrency(inv.total, 'FCFA')}</span>
                    </td>
                    <td className="py-4">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setDropdownOpen(dropdownOpen === inv.id ? null : inv.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {dropdownOpen === inv.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                            <Link 
                              to={`/invoices/${inv.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Voir la facture
                            </Link>
                            {inv.owner && (
                              <Link 
                                to={`/admin/facty/users/${inv.owner.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <User className="w-3.5 h-3.5" />
                                Voir le propriétaire
                              </Link>
                            )}
                            <div className="h-px bg-slate-50 my-1" />
                            <button
                              onClick={() => {
                                setConfirmDelete(inv);
                                setDropdownOpen(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* État vide */}
        {filteredInvoices.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            {invoices.length === 0 ? (
              <>
                <p className="text-slate-800 font-bold">Aucune facture sur la plateforme</p>
                <p className="text-slate-500 text-sm mt-1">Les factures créées par les utilisateurs apparaîtront ici.</p>
              </>
            ) : (
              <>
                <p className="text-slate-800 font-bold">Aucun résultat pour ces filtres</p>
                <button 
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setUserFilter('all');
                    setPeriodFilter('all');
                  }}
                  className="text-indigo-600 text-sm font-bold mt-4 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Affichage de <span className="text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à <span className="text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)}</span> sur <span className="text-slate-800">{filteredInvoices.length}</span> factures
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 transition-all hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 transition-all hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Supprimer la facture"
          message={`Êtes-vous sûr de vouloir supprimer la facture ${confirmDelete.invoice_number} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          confirmVariant="danger"
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

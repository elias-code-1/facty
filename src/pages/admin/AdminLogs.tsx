import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Key,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAdminLogs, AdminLog } from '../../hooks/useAdminLogs';
import LogItem from '../../components/admin/LogItem';
import FullPageSpinner from '../../components/ui/FullPageSpinner';

type LogCategory = 'all' | 'auth' | 'invoices' | 'clients' | 'profiles' | 'admin';
type PeriodFilter = 'all' | 'today' | 'week' | 'month';

const LOGS_PER_PAGE = 50;

/** Page du journal d'activité pour l'administrateur */
export default function AdminLogs() {
  const { logs, loading, refetch } = useAdminLogs();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LogCategory>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Liste des utilisateurs uniques pour le filtre
  const users = useMemo(() => {
    const uniqueUsers = new Map<string, { id: string; full_name: string }>();
    logs.forEach(log => {
      if (log.user) {
        uniqueUsers.set(log.user.id, { id: log.user.id, full_name: log.user.full_name });
      }
    });
    return Array.from(uniqueUsers.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [logs]);

  // Filtrage des logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Recherche (email, action, entity_type)
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        (log.user?.email || '').toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.entity_type.toLowerCase().includes(searchLower);
      
      // 2. Catégorie
      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'auth') matchesCategory = log.action.startsWith('auth.');
        else if (categoryFilter === 'invoices') matchesCategory = log.action.startsWith('invoice.');
        else if (categoryFilter === 'clients') matchesCategory = log.action.startsWith('client.');
        else if (categoryFilter === 'profiles') matchesCategory = log.action.startsWith('profile.');
        else if (categoryFilter === 'admin') matchesCategory = ['account.suspended', 'account.reactivated'].includes(log.action);
      }
      
      // 3. Utilisateur
      const matchesUser = userFilter === 'all' || log.user_id === userFilter;
      
      // 4. Période
      let matchesPeriod = true;
      if (periodFilter !== 'all') {
        const date = new Date(log.created_at);
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
        }
      }
      
      return matchesSearch && matchesCategory && matchesUser && matchesPeriod;
    });
  }, [logs, search, categoryFilter, userFilter, periodFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  // Stats rapides (sur tous les logs)
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      total: logs.length,
      today: logs.filter(l => new Date(l.created_at) >= startOfDay).length,
      logins: logs.filter(l => l.action === 'auth.login').length,
      critical: logs.filter(l => ['account.suspended', 'invoice.deleted'].includes(l.action)).length
    };
  }, [logs]);

  if (loading && logs.length === 0) return <FullPageSpinner />;

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Journal d'activité</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">En direct</span>
            </div>
          </div>
          <p className="text-slate-500 mt-1">{stats.total} actions enregistrées sur la plateforme.</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs font-medium text-slate-500">Total actions</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.today}</p>
          <p className="text-xs font-medium text-slate-500">Aujourd'hui</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <Key className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.logins}</p>
          <p className="text-xs font-medium text-slate-500">Connexions</p>
        </div>
        <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm ${stats.critical > 0 ? 'border-red-100' : ''}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stats.critical > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className={`text-2xl font-bold ${stats.critical > 0 ? 'text-red-600' : 'text-slate-800'}`}>{stats.critical}</p>
          <p className="text-xs font-medium text-slate-500">Actions critiques</p>
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
              placeholder="Rechercher par email, action ou type..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          
          {/* Filtre catégorie */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <div className="flex p-1 bg-slate-50 rounded-xl">
              {(['all', 'auth', 'invoices', 'clients', 'profiles', 'admin'] as LogCategory[]).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategoryFilter(c); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    categoryFilter === c 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {c === 'all' ? 'Toutes' : c === 'auth' ? 'Auth' : c === 'invoices' ? 'Factures' : c === 'clients' ? 'Clients' : c === 'profiles' ? 'Profils' : 'Admin'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          {/* Filtre par utilisateur */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={userFilter}
              onChange={(e) => { setUserFilter(e.target.value); setCurrentPage(1); }}
              className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          {/* Filtre par période */}
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <select
              value={periodFilter}
              onChange={(e) => { setPeriodFilter(e.target.value as PeriodFilter); setCurrentPage(1); }}
              className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">Toute la période</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 divide-y divide-slate-50">
          <AnimatePresence mode="popLayout">
            {paginatedLogs.map((log, index) => (
              <LogItem key={log.id} log={log} index={index} />
            ))}
          </AnimatePresence>
          
          {/* État vide */}
          {filteredLogs.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-slate-300" />
              </div>
              {logs.length === 0 ? (
                <>
                  <p className="text-slate-800 font-bold">Aucune activité enregistrée</p>
                  <p className="text-slate-500 text-sm mt-1">Les actions des utilisateurs apparaîtront ici en temps réel.</p>
                </>
              ) : (
                <>
                  <p className="text-slate-800 font-bold">Aucun log ne correspond aux filtres</p>
                  <button 
                    onClick={() => {
                      setSearch('');
                      setCategoryFilter('all');
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Affichage de <span className="text-slate-800">{(currentPage - 1) * LOGS_PER_PAGE + 1}</span> à <span className="text-slate-800">{Math.min(currentPage * LOGS_PER_PAGE, filteredLogs.length)}</span> sur <span className="text-slate-800">{filteredLogs.length}</span> logs
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNum 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                          : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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
    </div>
  );
}

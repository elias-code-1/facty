import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Search, 
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAdminPayments } from '../../hooks/useAdminPayments';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { formatCurrency } from '../../utils/format';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  Line 
} from 'recharts';

export default function AdminPayments() {
  const { 
    revenuTotal, 
    revenuCeMois, 
    nombreTransactions, 
    tauxConversion, 
    panierMoyen, 
    revenuParMois, 
    transactions, 
    loading, 
    refetch 
  } = useAdminPayments();

  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const statusMatch = activeTab === 'all' || t.status.toLowerCase() === activeTab;
      
      const query = searchQuery.toLowerCase();
      const searchMatch = 
        (t.profiles?.full_name || '').toLowerCase().includes(query) ||
        (t.profiles?.email || '').toLowerCase().includes(query) ||
        (t.transaction_id || '').toLowerCase().includes(query);
        
      return statusMatch && searchMatch;
    });
  }, [transactions, activeTab, searchQuery]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'success') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle size={12} />
          Succès
        </span>
      );
    }
    if (s === 'failed' || s === 'failure' || s === 'error') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          <XCircle size={12} />
          Échec
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
        <Clock size={12} />
        En attente
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CreditCard className="text-indigo-600" />
            Paiements & Revenus
          </h1>
          <p className="text-slate-500 mt-1">
            Suivi des transactions KKiaPay et revenus de la plateforme.
          </p>
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

      <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm flex gap-3">
        <Activity className="shrink-0 mt-0.5" size={18} />
        <p>
          <strong>Note :</strong> Ces chiffres reflètent les paiements confirmés uniquement — les tentatives échouées ne sont pas encore toutes enregistrées si l'utilisateur quitte la page trop tôt.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard 
          title="Revenu total" 
          value={formatCurrency(revenuTotal, 'XOF')}
          icon={<DollarSign size={24} />}
          accentColor="indigo"
          index={0}
        />
        <AdminStatCard 
          title="Revenu ce mois" 
          value={formatCurrency(revenuCeMois, 'XOF')}
          icon={<Calendar size={24} />}
          accentColor="blue"
          index={1}
        />
        <AdminStatCard 
          title="Transactions" 
          value={nombreTransactions}
          icon={<CreditCard size={24} />}
          accentColor="green"
          index={2}
        />
        <AdminStatCard 
          title="Conversion" 
          value={`${tauxConversion.toFixed(1)}%`}
          icon={<TrendingUp size={24} />}
          accentColor="orange"
          index={3}
        />
        <AdminStatCard 
          title="Panier moyen" 
          value={formatCurrency(panierMoyen, 'XOF')}
          icon={<Activity size={24} />}
          accentColor="violet"
          index={4}
        />
      </div>

      {/* Graphique */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-500" />
          Évolution des revenus
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={revenuParMois} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? formatCurrency(value, 'XOF') : value, 
                  name === 'revenue' ? 'Revenu' : 'Transactions'
                ]}
              />
              <Bar yAxisId="left" dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            {(['all', 'success', 'pending', 'failed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'all' && 'Toutes'}
                {tab === 'success' && 'Réussies'}
                {tab === 'pending' && 'En attente'}
                {tab === 'failed' && 'Échouées'}
              </button>
            ))}
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher (nom, email, transaction)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Montant</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredTransactions.map((tx) => (
                  <motion.tr 
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{tx.profiles?.full_name || 'Utilisateur inconnu'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{tx.profiles?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {tx.transaction_id || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(tx.amount || 0, tx.currency || 'XOF')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`/admin/facty/users/${tx.user_id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Voir l'utilisateur"
                      >
                        <Search size={16} />
                      </a>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredTransactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard size={48} className="text-slate-200 mb-4" />
                      <p className="text-lg font-medium text-slate-700">Aucune transaction trouvée</p>
                      <p className="text-sm mt-1">Essayez de modifier vos filtres de recherche.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

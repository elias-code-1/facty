import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Activity, 
  PieChart, 
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';
import { formatCurrency } from '../../utils/format';
import FunnelChart from '../../components/admin/FunnelChart';
import RetentionChart from '../../components/admin/RetentionChart';
import ActivityHeatmap from '../../components/admin/ActivityHeatmap';
import InactiveUsers from '../../components/admin/InactiveUsers';
import FullPageSpinner from '../../components/ui/FullPageSpinner';

/** Page de statistiques avancées (Business Intelligence) pour l'administrateur */
export default function AdminStats() {
  const stats = useAdminStats();

  if (stats.loading) return <FullPageSpinner />;

  if (!stats.funnel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
          <BarChart3 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pas encore assez de données</h2>
        <p className="text-slate-500 max-w-md">
          Invoxa a besoin de plus d'utilisateurs et d'activité pour générer des analyses de Business Intelligence pertinentes.
        </p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Statistiques avancées</h1>
        <p className="text-slate-500 mt-1">Business Intelligence — Invoxa</p>
      </div>

      {/* Section 1 : Métriques clés */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold">
              <TrendingUp size={12} />
              +12%
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.avgInvoicesPerUser?.toFixed(1)}</p>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Moyenne factures/user</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold">
              <TrendingUp size={12} />
              +8%
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.avgRevenuePerUser || 0)}</p>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Revenu moyen/user</p>
        </motion.div>

        <motion.div variants={item} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={24} />
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Délai moyen
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.avgDaysToFirstInvoice} jours</p>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Délai 1ère facture</p>
          <p className="text-[10px] text-slate-400 mt-1 italic">Après l'inscription en moyenne</p>
        </motion.div>
      </motion.div>

      {/* Section 2 & 3 : Funnel & Rétention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Funnel d'activation</h3>
              <p className="text-xs text-slate-500">De l'inscription à l'engagement</p>
            </div>
          </div>
          <FunnelChart data={stats.funnel} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Rétention mensuelle</h3>
              <p className="text-xs text-slate-500">% d'utilisateurs revenus le mois suivant</p>
            </div>
          </div>
          <RetentionChart data={stats.retention || []} />
        </motion.div>
      </div>

      {/* Section 4 : Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Heatmap d'activité</h3>
              <p className="text-xs text-slate-500">Quand vos utilisateurs sont le plus actifs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-indigo-100" />
              <span className="text-[10px] font-bold text-slate-400">Faible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-indigo-700" />
              <span className="text-[10px] font-bold text-slate-400">Intense</span>
            </div>
          </div>
        </div>
        <ActivityHeatmap data={stats.heatmap || []} />
      </motion.div>

      {/* Section 5 : Users inactifs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Utilisateurs inactifs</h3>
            <p className="text-xs text-slate-500">Utilisateurs n'ayant pas été vus depuis 7+ jours</p>
          </div>
        </div>
        <InactiveUsers users={stats.inactiveUsers || []} />
      </motion.div>
    </div>
  );
}

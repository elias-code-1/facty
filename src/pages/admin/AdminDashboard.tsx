import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Clock,
  Bell,
  ArrowRight,
  User,
  AlertTriangle,
  XCircle,
  CreditCard,
  Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import AdminStatCard from '../../components/admin/AdminStatCard';
import UsersGrowthChart from '../../components/admin/UsersGrowthChart';
import InvoicesVolumeChart from '../../components/admin/InvoicesVolumeChart';
import StatusDistributionChart from '../../components/admin/StatusDistributionChart';
import { formatCurrency } from '../../utils/format';
import { timeAgo } from '../../utils/date';
import FullPageSpinner from '../../components/ui/FullPageSpinner';
import { supabase } from '../../lib/supabase';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': "s'est connecté",
  'auth.register': "s'est inscrit",
  'invoice.created': "a créé une facture",
  'invoice.deleted': "a supprimé une facture",
  'invoice.exported_pdf': "a exporté un PDF",
  'client.created': "a ajouté un client",
  'account.suspended': "a été suspendu",
  'profile.updated': "a mis à jour son profil",
};

const ACTION_COLORS: Record<string, string> = {
  'auth': 'text-blue-600 bg-blue-100',
  'invoice': 'text-indigo-600 bg-indigo-100',
  'client': 'text-emerald-600 bg-emerald-100',
  'account': 'text-rose-600 bg-rose-100',
  'profile': 'text-amber-600 bg-amber-100',
};

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  'new_user': <User className="w-4 h-4 text-blue-600" />,
  'limit_reached': <AlertTriangle className="w-4 h-4 text-orange-600" />,
  'critical_error': <XCircle className="w-4 h-4 text-red-600" />,
};

const NOTIF_BGS: Record<string, string> = {
  'new_user': 'bg-blue-100',
  'limit_reached': 'bg-orange-100',
  'critical_error': 'bg-red-100',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { 
    totalUsers, activeUsers, suspendedUsers, newUsersToday, newUsersThisMonth, totalTeamMembers,
    totalInvoices, totalRevenue, invoicesToday, invoicesThisMonth, pendingAmount,
    platformRevenue, premiumUsers,
    usersGrowthByMonth, invoicesByMonth, statusDistribution,
    recentLogs, unreadNotifications, topUsers, loading 
  } = useAdminDashboard();

  useEffect(() => {
    async function updateDb() {
      const { data } = await supabase.from('landing_page_content').select('*');
      if (data) {
        for (const item of data) {
          if (typeof item.value === 'string' && (item.value.includes('Invoxa') || item.value.includes('invoxa'))) {
            const newValue = item.value.replace(/Invoxa/g, 'Facty').replace(/invoxa/g, 'facty');
            await supabase.from('landing_page_content').update({ 
              value: newValue,
              section: item.section || 'General'
            }).eq('key', item.key);
          }
        }
        localStorage.removeItem('facty_landing_content');
      }
    }
    updateDb();
  }, []);

  if (loading) return <FullPageSpinner />;

  const isOwner = profile?.role === 'admin';
  const firstName = profile?.full_name?.split(' ')[0] || 'Admin';
  const today = new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">
            Bienvenue, <span className="font-semibold text-indigo-600">{firstName}</span> 👋 
            Voici un aperçu de la plateforme.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" />
          {today.charAt(0).toUpperCase() + today.slice(1)}
        </div>
      </div>

      {/* Notifications non lues */}
      {isOwner && unreadNotifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-900 font-bold">
              <Bell className="w-5 h-5" />
              <span>Notifications prioritaires</span>
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {unreadNotifications.length}
              </span>
            </div>
            <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Tout marquer comme lu
            </button>
          </div>
          <div className="space-y-2">
            {unreadNotifications.slice(0, 3).map((notif) => (
              <div key={notif.id} className="bg-white/60 backdrop-blur-sm p-3 rounded-xl flex items-center justify-between gap-4 border border-indigo-100/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${NOTIF_BGS[notif.type] || 'bg-slate-100'} flex items-center justify-center`}>
                    {NOTIF_ICONS[notif.type] || <Bell className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-800 font-medium">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* StatCards - Uniquement pour Admin ou roles spécifiques */}
      {isOwner && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <AdminStatCard
            index={0}
            title="Revenus Facty (Pro)"
            value={`${platformRevenue.toLocaleString()} FCFA`}
            subtitle="Chiffre d'affaires"
            icon={<CreditCard className="w-5 h-5 text-white" />}
            accentColor="emerald"
          />
          <AdminStatCard
            index={1}
            title="Utilisateurs Premium"
            value={premiumUsers}
            subtitle={`${((premiumUsers / Math.max(totalUsers, 1)) * 100).toFixed(1)}% des inscrits`}
            icon={<Crown className="w-5 h-5 text-white" />}
            accentColor="yellow"
          />
          <AdminStatCard
            index={2}
            title="Total utilisateurs"
            value={totalUsers}
            subtitle={`+${newUsersToday} aujourd'hui`}
            icon={<Users className="w-5 h-5 text-white" />}
            accentColor="indigo"
          />
          <AdminStatCard
            index={3}
            title="Total factures (Plateforme)"
            value={totalInvoices}
            subtitle={`+${invoicesToday} aujourd'hui`}
            icon={<FileText className="w-5 h-5 text-white" />}
            accentColor="violet"
          />
        </div>
      )}

      {!isOwner && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-4xl mb-4">👋</p>
          <h2 className="text-xl font-bold text-slate-800">Bienvenue dans l'équipe Facty</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            Utilisez la barre latérale pour accéder aux outils autorisés pour votre rôle.
          </p>
        </div>
      )}

      {/* Graphes Principaux - Uniquement pour Admin */}
      {isOwner && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InvoicesVolumeChart data={invoicesByMonth} />
            </div>
            <div className="lg:col-span-1">
              <StatusDistributionChart data={statusDistribution} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UsersGrowthChart data={usersGrowthByMonth} />
            
            {/* Activité récente */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Activité récente</h3>
                <Link to="/admin/facty/logs" className="text-xs font-semibold text-indigo-600 hover:translate-x-1 transition-transform flex items-center gap-1">
                  Voir tous les logs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="space-y-4 flex-1">
                {recentLogs.map((log) => {
                  const category = log.action.split('.')[0];
                  const initials = log.profiles?.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || '?';
                  
                  return (
                    <div key={log.id} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border-2 border-white shadow-sm">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {log.profiles?.full_name || 'Utilisateur inconnu'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${ACTION_COLORS[category] || 'bg-slate-100 text-slate-600'}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ACTION_LABELS[log.action] || log.action} • {timeAgo(log.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Utilisateurs les plus actifs (Facturation platforme)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-4 pl-2">#</th>
                    <th className="pb-4">Utilisateur</th>
                    <th className="pb-4">Factures</th>
                    <th className="pb-4">Revenus traités</th>
                    <th className="pb-4 text-right pr-2">Depuis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topUsers.map((u, i) => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2 text-sm font-bold text-slate-400">{i + 1}</td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-semibold text-slate-600">{u.count}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(u.revenue)}</span>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <span className="text-xs text-slate-500">{new Date(u.since).toLocaleDateString('fr-FR')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

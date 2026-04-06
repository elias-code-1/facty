import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useDashboard } from '../hooks/useDashboard';
import { useAnnouncement } from '../hooks/useAnnouncement';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { 
  FileText, 
  Users, 
  Clock, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  ArrowRight,
  Rocket
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import StatusChart from '../components/dashboard/StatusChart';
import InvoiceStatusBadge from '../components/invoice/InvoiceStatusBadge';
import AnnouncementBanner from '../components/admin/AnnouncementBanner';
import { formatCurrency, formatDate } from '../utils/invoice';
import Spinner from '../components/ui/Spinner';

import { motion, AnimatePresence } from 'motion/react';

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

/** Page d'accueil du tableau de bord */
export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile(user);
  const stats = useDashboard(user);
  const { announcements, dismissAnnouncement } = useAnnouncement();
  const { clients } = useFeatureFlags();
  const navigate = useNavigate();

  const firstName = profile?.full_name?.split(' ')[0] || 'Utilisateur';
  const currency = profile?.currency || 'FCFA';

  // Salutation dynamique
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bonne matinée";
    if (hour >= 12 && hour < 18) return "Bon après-midi";
    if (hour >= 18 && hour < 22) return "Bonne soirée";
    return "Bonne nuit";
  };

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const isEmpty = stats.totalInvoices === 0;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* SECTION 1 : Salutation */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-slate-500 mt-1">{getGreeting()}</p>
      </div>

      {/* SECTION ANNONCES */}
      <div className="mb-8 space-y-3">
        <AnimatePresence mode="popLayout">
          {announcements.slice(0, 2).map(ann => (
            <AnnouncementBanner
              key={ann.id}
              announcement={ann}
              onDismiss={() => dismissAnnouncement(ann.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* SECTION 2 : StatCards */}
      <motion.div 
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >

        <StatCard
          index={0}
          title="Total factures"
          value={stats.totalInvoices}
          subtitle={`+${stats.invoicesThisMonth} ce mois`}
          icon={<FileText size={20} />}
          accentColor="indigo"
        />
        <StatCard
          index={1}
          title="Revenus encaissés"
          value={formatCurrency(stats.totalRevenue, currency)}
          subtitle={`+${formatCurrency(stats.revenueThisMonth, currency)} ce mois`}
          icon={<TrendingUp size={20} />}
          accentColor="green"
        />
        <StatCard
          index={2}
          title="En attente"
          value={formatCurrency(stats.pendingAmount, currency)}
          subtitle={`${stats.statusBreakdown.sent} factures`}
          icon={<Clock size={20} />}
          accentColor="orange"
        />
        {clients && (
          <StatCard
            index={3}
            title="Clients"
            value={stats.totalClients}
            subtitle="clients actifs"
            icon={<Users size={20} />}
            accentColor="blue"
          />
        )}
      </motion.div>

      {isEmpty ? (
        /* SECTION 5 : CTA si aucune facture */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <Rocket className="text-indigo-600 w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Créez votre première facture</h2>
          <p className="text-slate-500 max-w-md mb-8 text-sm md:text-base">
            Commencez à suivre vos revenus et gérez vos clients en quelques clics.
          </p>
          <Link
            to="/invoices/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 md:px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Nouvelle facture
          </Link>
        </div>
      ) : (
        <>
          {/* SECTION 3 : Graphes */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="lg:col-span-2">
              <RevenueChart data={stats.revenueByMonth} currency={currency} />
            </div>
            <div className="lg:col-span-1">
              <StatusChart data={stats.statusBreakdown} />
            </div>
          </motion.div>

          {/* SECTION 4 : Factures récentes */}
          <motion.div 
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Factures récentes</h2>
              <Link to="/invoices" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Voir toutes
                <ChevronRight size={16} />
              </Link>
            </div>
            
            {/* Table View (Tablet/Desktop) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-6 py-3">N°</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Montant</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentInvoices.map((inv) => (
                    <tr 
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="group hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{inv.clients?.name || '---'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(inv.issue_date)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View (Mobile) */}
            <div className="md:hidden divide-y divide-slate-50">
              {stats.recentInvoices.map((inv) => (
                <div 
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="p-4 active:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-900">{inv.invoice_number}</span>
                    <InvoiceStatusBadge status={inv.status} size="sm" />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{inv.clients?.name || '---'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(inv.issue_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {/* BOUTON FLOTTANT (mobile uniquement) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="md:hidden fixed bottom-6 right-6 z-40"
      >
        <Link
          to="/invoices/new"
          className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-all no-print"
        >
          <Plus size={28} />
        </Link>
      </motion.div>
    </div>
  );
}

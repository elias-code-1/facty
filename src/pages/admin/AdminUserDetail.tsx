import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  FileText, 
  DollarSign, 
  Users as UsersIcon,
  Ban,
  UserCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile, Invoice, AuditLog } from '../../types/database';
import UserStatusBadge from '../../components/admin/UserStatusBadge';
import { formatDate, formatCurrency } from '../../utils/format';
import { timeAgo } from '../../utils/date';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import FullPageSpinner from '../../components/ui/FullPageSpinner';
import { useAdminUsers } from '../../hooks/useAdminUsers';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': "s'est connecté",
  'auth.register': "s'est inscrit",
  'invoice.created': "a créé une facture",
  'invoice.deleted': "a supprimé une facture",
  'invoice.exported_pdf': "a exporté un PDF",
  'client.created': "a ajouté un client",
  'account.suspended': "a été suspendu",
  'account.reactivated': "a été réactivé",
  'profile.updated': "a mis à jour son profil",
};

const ACTION_COLORS: Record<string, string> = {
  'auth': 'text-blue-600 bg-blue-100',
  'invoice': 'text-indigo-600 bg-indigo-100',
  'client': 'text-emerald-600 bg-emerald-100',
  'account': 'text-rose-600 bg-rose-100',
  'profile': 'text-amber-600 bg-amber-100',
};

/** Page de détail d'un utilisateur pour l'administrateur */
export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suspendUser, reactivateUser, deleteUser } = useAdminUsers();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [invoices, setInvoices] = useState<(Invoice & { clients: { name: string } | null })[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [clientCount, setClientCount] = useState(0);

  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [profileRes, invoicesRes, logsRes, clientsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('invoices').select('*, clients(name)').eq('user_id', id).order('created_at', { ascending: false }),
        supabase.from('audit_logs').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(20),
        supabase.from('clients').select('id', { count: 'exact' }).eq('user_id', id)
      ]);

      if (profileRes.error) throw profileRes.error;
      setProfile(profileRes.data);
      setInvoices(invoicesRes.data || []);
      setLogs(logsRes.data || []);
      setClientCount(clientsRes.count || 0);
    } catch (err) {
      console.error('Erreur lors du fetch des détails utilisateur:', err);
      setToast({ message: "Erreur lors du chargement des données.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSuspend = async () => {
    if (!profile) return;
    try {
      await suspendUser(profile.id, profile.email);
      setToast({ message: "Utilisateur suspendu.", type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: "Erreur lors de la suspension.", type: 'error' });
    } finally {
      setConfirmSuspend(false);
    }
  };

  const handleReactivate = async () => {
    if (!profile) return;
    try {
      await reactivateUser(profile.id, profile.email);
      setToast({ message: "Utilisateur réactivé.", type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: "Erreur lors de la réactivation.", type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    try {
      await deleteUser(profile.id);
      setToast({ message: "Utilisateur supprimé définitivement.", type: 'success' });
      setTimeout(() => navigate('/admin/invoxa/users'), 1500);
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: 'error' });
    } finally {
      setConfirmDelete(false);
    }
  };

  if (loading) return <FullPageSpinner />;
  if (!profile) return <div className="p-8 text-center">Utilisateur non trouvé.</div>;

  const initials = profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col gap-4">
        <Link 
          to="/admin/invoxa/users" 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux utilisateurs
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil de {profile.full_name}</h1>
            <UserStatusBadge is_suspended={profile.is_suspended} />
          </div>
        </div>
      </div>

      {/* SECTION 1 : Carte profil et Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Infos Profil */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 border-4 border-white shadow-md mb-4">
              {initials}
            </div>
            <h2 className="text-lg font-bold text-slate-800">{profile.full_name}</h2>
            <p className="text-sm text-slate-400">{profile.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                <span className="text-slate-700 font-medium">{profile.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</span>
                <span className="text-slate-700 font-medium">{profile.phone || 'Non renseigné'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entreprise</span>
                <span className="text-slate-700 font-medium">{profile.company_name || 'Non renseigné'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Devise préférée</span>
                <span className="text-slate-700 font-medium">{profile.currency}</span>
              </div>
            </div>
            <div className="h-px bg-slate-50 my-4" />
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membre depuis</span>
                <span className="text-slate-700 font-medium">{formatDate(profile.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dernière activité</span>
                <span className="text-slate-700 font-medium">{profile.last_seen_at ? timeAgo(profile.last_seen_at) : 'Inconnue'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats et Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mini Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Factures</p>
              <p className="text-xl font-bold text-slate-800">{invoices.length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payées</p>
              <p className="text-xl font-bold text-green-600">{invoices.filter(i => i.status === 'paid').length}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenus</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalPaid, profile.currency)}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clients</p>
              <p className="text-xl font-bold text-blue-600">{clientCount}</p>
            </div>
          </div>

          {/* SECTION 2 : Actions admin */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Actions d'administration</h3>
            <div className="flex flex-wrap gap-3">
              {!profile.is_suspended ? (
                <button
                  onClick={() => setConfirmSuspend(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Ban className="w-4 h-4" />
                  Suspendre le compte
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Réactiver le compte
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 italic">
              * La suspension empêche l'utilisateur de se connecter mais conserve ses données. 
              La suppression est irréversible.
            </p>
          </div>

          {/* SECTION 3 : Factures de l'utilisateur */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Factures ({invoices.length})</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total facturé: {formatCurrency(totalInvoiced, profile.currency)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="py-3 pl-6">N°</th>
                    <th className="py-3">Client</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Total</th>
                    <th className="py-3">Statut</th>
                    <th className="py-3 pr-6 text-right">Lien</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.slice(0, 10).map((inv) => (
                    <tr key={inv.id} className="text-xs hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-6 font-bold text-slate-700">{inv.invoice_number}</td>
                      <td className="py-3 text-slate-600">{inv.clients?.name || 'Client supprimé'}</td>
                      <td className="py-3 text-slate-500">{new Date(inv.issue_date).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 font-bold text-slate-800">{formatCurrency(inv.total, inv.currency)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-600' :
                          inv.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                          inv.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-6 text-right">
                        <Link to={`/invoices/${inv.id}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors inline-block">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {invoices.length > 10 && (
              <div className="p-4 bg-slate-50 text-center">
                <p className="text-[10px] text-slate-400 font-medium">Affichage des 10 dernières factures sur {invoices.length}</p>
              </div>
            )}
            {invoices.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Aucune facture créée.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4 : Activité de l'utilisateur */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Journal d'activité</h3>
        <div className="space-y-4">
          {logs.map((log) => {
            const category = log.action.split('.')[0];
            return (
              <div key={log.id} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ACTION_COLORS[category] || 'bg-slate-100 text-slate-600'}`}>
                  {category === 'auth' ? <User className="w-4 h-4" /> : 
                   category === 'invoice' ? <FileText className="w-4 h-4" /> : 
                   category === 'client' ? <UsersIcon className="w-4 h-4" /> : 
                   <Clock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium">
                    {ACTION_LABELS[log.action] || log.action}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {timeAgo(log.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          {logs.length === 0 && (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucune activité enregistrée.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        onConfirm={handleSuspend}
        title="Suspendre l'utilisateur"
        message={`Êtes-vous sûr de vouloir suspendre ${profile.email} ? Cet utilisateur ne pourra plus se connecter.`}
        confirmLabel="Suspendre"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer définitivement"
        message={`Cette action est IRRÉVERSIBLE. Toutes les données de ${profile.email} seront supprimées (factures, clients, profil).`}
        confirmLabel="Supprimer définitivement"
        confirmVariant="danger"
      />

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

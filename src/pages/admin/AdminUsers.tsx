import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  UserCheck, 
  Trash2,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminUsers, AdminUser } from '../../hooks/useAdminUsers';
import UserStatusBadge from '../../components/admin/UserStatusBadge';
import { formatDate, formatCurrency } from '../../utils/format';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';
import FullPageSpinner from '../../components/ui/FullPageSpinner';

type UserFilter = 'all' | 'active' | 'suspended';

/** Page de gestion des utilisateurs pour l'administrateur */
export default function AdminUsers() {
  const navigate = useNavigate();
  const { users, loading, suspendUser, reactivateUser, deleteUser } = useAdminUsers();
  
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  const [confirmSuspend, setConfirmSuspend] = useState<AdminUser | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'active' && !u.is_suspended) || 
        (filter === 'suspended' && u.is_suspended);
      
      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);

  // Stats rapides
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.is_suspended).length;
  const suspendedUsers = users.filter(u => u.is_suspended).length;

  const handleSuspend = async () => {
    if (!confirmSuspend) return;
    try {
      await suspendUser(confirmSuspend.id, confirmSuspend.email);
      setToast({ message: `Utilisateur ${confirmSuspend.email} suspendu.`, type: 'success' });
    } catch (err) {
      setToast({ message: "Erreur lors de la suspension.", type: 'error' });
    } finally {
      setConfirmSuspend(null);
    }
  };

  const handleReactivate = async (u: AdminUser) => {
    try {
      await reactivateUser(u.id, u.email);
      setToast({ message: `Utilisateur ${u.email} réactivé.`, type: 'success' });
    } catch (err) {
      setToast({ message: "Erreur lors de la réactivation.", type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      setToast({ message: `Utilisateur supprimé définitivement.`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || "Erreur lors de la suppression.", type: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Couleur d'avatar par hash
  const getAvatarColor = (name: string) => {
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-orange-100 text-orange-600', 'bg-violet-100 text-violet-600', 'bg-pink-100 text-pink-600', 'bg-teal-100 text-teal-600'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="space-y-8 pb-12">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Utilisateurs</h1>
          <p className="text-slate-500 mt-1">{totalUsers} utilisateurs inscrits sur la plateforme.</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{totalUsers}</p>
            <p className="text-xs font-medium text-slate-500">Total inscrits</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{activeUsers}</p>
            <p className="text-xs font-medium text-slate-500">Comptes actifs</p>
          </div>
        </div>
        <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 ${suspendedUsers > 0 ? 'border-red-100' : ''}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${suspendedUsers > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${suspendedUsers > 0 ? 'text-red-600' : 'text-slate-800'}`}>{suspendedUsers}</p>
            <p className="text-xs font-medium text-slate-500">Suspendus</p>
          </div>
        </div>
      </div>

      {/* Recherche et Filtres */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <div className="flex p-1 bg-slate-50 rounded-xl">
            {(['all', 'active', 'suspended'] as UserFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Suspendus'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="py-4 pl-6">Utilisateur</th>
                <th className="py-4">Inscrit le</th>
                <th className="py-4">Factures</th>
                <th className="py-4">Revenus</th>
                <th className="py-4">Statut</th>
                <th className="py-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((u, i) => {
                  const initials = u.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const avatarColor = getAvatarColor(u.full_name);
                  
                  return (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/invoxa/users/${u.id}`)}
                    >
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm ${avatarColor}`}>
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-800 truncate">{u.full_name}</span>
                            <span className="text-[10px] text-slate-400 truncate">{u.email}</span>
                            {u.company_name && (
                              <span className="text-[10px] text-slate-500 font-medium truncate">{u.company_name}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-slate-600">{formatDate(u.created_at)}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{u.invoice_count}</span>
                          <span className="text-[10px] text-slate-400">factures</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(u.total_paid, 'FCFA')}</span>
                      </td>
                      <td className="py-4">
                        <UserStatusBadge is_suspended={u.is_suspended} size="sm" />
                      </td>
                      <td className="py-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setDropdownOpen(dropdownOpen === u.id ? null : u.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {dropdownOpen === u.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
                              <Link 
                                to={`/admin/invoxa/users/${u.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Voir le profil
                              </Link>
                              <div className="h-px bg-slate-50 my-1" />
                              
                              {!u.is_suspended ? (
                                <button
                                  onClick={() => {
                                    setConfirmSuspend(u);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Suspendre
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleReactivate(u);
                                    setDropdownOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50 transition-colors"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  Réactiver
                                </button>
                              )}
                              
                              <div className="h-px bg-slate-50 my-1" />
                              <button
                                onClick={() => {
                                  setConfirmDelete(u);
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
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">Aucun utilisateur trouvé.</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {confirmSuspend && (
        <ConfirmDialog
          isOpen={!!confirmSuspend}
          onClose={() => setConfirmSuspend(null)}
          onConfirm={handleSuspend}
          title="Suspendre l'utilisateur"
          message={`Êtes-vous sûr de vouloir suspendre ${confirmSuspend.email} ? Cet utilisateur ne pourra plus se connecter.`}
          confirmLabel="Suspendre"
          confirmVariant="danger"
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Supprimer définitivement"
          message={`Cette action est IRRÉVERSIBLE. Toutes les données de ${confirmDelete.email} seront supprimées (factures, clients, profil).`}
          confirmLabel="Supprimer définitivement"
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

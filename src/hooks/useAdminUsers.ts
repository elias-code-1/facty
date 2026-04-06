import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Invoice } from '../types/database';
import { useAuth } from './useAuth';

export type AdminUser = Profile & {
  invoice_count: number;
  total_invoiced: number;
  total_paid: number;
};

/** Hook pour la gestion des utilisateurs par l'administrateur */
export function useAdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Requête 1 : tous les profils non-admin
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Requête 2 : toutes les factures
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, user_id, total, status');

      if (invoicesError) throw invoicesError;

      // Combiner les données manuellement
      const usersWithStats: AdminUser[] = (profiles ?? []).map(profile => {
        const userInvoices = (invoices ?? []).filter(
          inv => inv.user_id === profile.id
        );
        return {
          ...profile,
          invoice_count: userInvoices.length,
          total_invoiced: userInvoices.reduce(
            (sum, inv) => sum + (inv.total || 0), 0
          ),
          total_paid: userInvoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (inv.total || 0), 0)
        };
      });

      setUsers(usersWithStats);
    } catch (err: any) {
      console.error('Erreur lors du fetch des utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const suspendUser = async (id: string, email: string) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: true } : u));

      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: true })
        .eq('id', id);

      if (error) throw error;

      // Log l'action
      await supabase.from('audit_logs').insert({
        user_id: currentUser?.id,
        action: 'account.suspended',
        entity_type: 'profile',
        entity_id: id,
        metadata: { target_user_id: id, target_email: email }
      });

      // Notification admin
      await supabase.from('admin_notifications').insert({
        type: 'critical_error',
        message: `Utilisateur suspendu : ${email}`,
        metadata: { target_user_id: id }
      });

    } catch (err) {
      console.error('Erreur suspendUser:', err);
      // Rollback optimistic update
      fetchUsers();
      throw err;
    }
  };

  const reactivateUser = async (id: string, email: string) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_suspended: false } : u));

      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: false })
        .eq('id', id);

      if (error) throw error;

      // Log l'action
      await supabase.from('audit_logs').insert({
        user_id: currentUser?.id,
        action: 'account.reactivated',
        entity_type: 'profile',
        entity_id: id,
        metadata: { target_user_id: id, target_email: email }
      });

    } catch (err) {
      console.error('Erreur reactivateUser:', err);
      // Rollback optimistic update
      fetchUsers();
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Appel de l'Edge Function pour la suppression Supabase Auth
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: id }
      });

      if (error) {
        // Fallback si l'Edge Function n'est pas déployée ou échoue
        console.warn('Edge Function delete-user failed, falling back to suspension:', error);
        await suspendUser(id, 'unknown');
        throw new Error("La suppression réelle nécessite le déploiement de l'Edge Function. L'utilisateur a été suspendu par sécurité.");
      }

      setUsers(prev => prev.filter(u => u.id !== id));
      return data;
    } catch (err) {
      console.error('Erreur deleteUser:', err);
      throw err;
    }
  };

  return {
    users,
    loading,
    suspendUser,
    reactivateUser,
    deleteUser,
    refetch: fetchUsers
  };
}

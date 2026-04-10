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

      // Requête 1 : tous les profils non-admin et qui ne sont pas des membres d'équipe
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .is('team_role', null)
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
      // On force la récupération de la session la plus fraîche
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Session expirée ou invalide. Veuillez vous reconnecter.");
      }
      
      // Appel de notre API locale (Vercel)
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId: id })
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error("Erreur de parsing JSON:", text);
        throw new Error(`Réponse serveur invalide (${response.status})`);
      }

      if (!response.ok) {
        // Fallback si la clé n'est pas configurée
        if (data.error?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          console.warn('Service Role Key non configurée, suspension de secours.');
          await suspendUser(id, 'unknown');
          throw new Error("La suppression réelle nécessite la configuration de la 'SUPABASE_SERVICE_ROLE_KEY' dans les paramètres de l'application. L'utilisateur a été suspendu par sécurité.");
        }
        
        const errorMessage = data.error || data.message || `Erreur serveur (${response.status})`;
        throw new Error(errorMessage);
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

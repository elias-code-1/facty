import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AuditLog, Profile } from '../types/database';

export type AdminLog = AuditLog & {
  user: {
    id: string;
    full_name: string;
    email: string;
  } | null;
};

/** Hook pour la gestion du journal d'activité admin */
export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      // Requête 1 : logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      // Requête 2 : profils pour afficher les noms
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (profilesError) throw profilesError;

      // Combiner
      const logsWithUsers: AdminLog[] = (logsData || []).map(log => ({
        ...log,
        user: (profilesData || []).find(p => p.id === log.user_id) ?? null
      }));

      setLogs(logsWithUsers);
    } catch (err) {
      console.error('Erreur lors du fetch des logs admin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();

    // Temps réel
    const channel = supabase
      .channel('audit_logs_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs'
      }, async (payload) => {
        const newLog = payload.new as AuditLog;
        
        // On récupère le profil si on ne l'a pas déjà en cache (ou on refetch tout pour simplifier et garder la cohérence)
        // Pour être performant et respecter la consigne du temps réel, on ajoute le log
        // mais on aura peut-être besoin du nom de l'user.
        // On va faire une petite requête rapide pour le profil de cet user précis.
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', newLog.user_id)
          .single();

        const logWithUser: AdminLog = {
          ...newLog,
          user: profile ?? null
        };

        setLogs(prev => [logWithUser, ...prev.slice(0, 499)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  return {
    logs,
    loading,
    refetch: fetchLogs
  };
}

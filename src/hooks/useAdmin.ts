import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { AdminNotification, AdminNotificationType } from '../types/database';

/** Hook pour la gestion de l'administration */
export function useAdmin() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user);
  
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = profile?.role === 'admin';

  const fetchNotifications = useCallback(async () => {
    if (!user || !isAdmin) return;

    try {
      setAdminLoading(true);
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setAdminNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Erreur lors du fetch des notifications admin:', err);
    } finally {
      setAdminLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();
    } else {
      setAdminLoading(false);
    }
  }, [isAdmin, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setAdminNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur markAsRead:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;

      setAdminNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur markAllAsRead:', err);
    }
  };

  return {
    isAdmin,
    adminLoading: adminLoading || profileLoading,
    adminNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetchNotifications: fetchNotifications
  };
}

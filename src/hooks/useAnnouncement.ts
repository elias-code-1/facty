import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Announcement } from '../types/database';
import { useAuth } from './useAuth';

export function useAnnouncement() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`target.eq.all,target_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      
      // Filtrer côté client
      const validAnnouncements = (data || []).filter(ann => {
        // 1. Vérifier l'expiration
        if (ann.expires_at && new Date(ann.expires_at) < now) {
          return false;
        }
        
        // 2. Vérifier si déjà dismiss
        const isDismissed = localStorage.getItem(`dismissed_announcement_${ann.id}`);
        if (isDismissed) {
          return false;
        }
        
        return true;
      });

      setAnnouncements(validAnnouncements);
    } catch (error) {
      console.error('Erreur fetchAnnouncements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const dismissAnnouncement = (id: string) => {
    localStorage.setItem(`dismissed_announcement_${id}`, 'true');
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return {
    announcements,
    loading,
    dismissAnnouncement,
    refetch: fetchAnnouncements
  };
}

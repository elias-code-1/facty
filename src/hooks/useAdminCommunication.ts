import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Announcement, Profile } from '../types/database';

export interface AnnouncementForm {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target: 'all' | 'specific';
  target_user_id?: string;
  expires_at?: string;
}

export function useAdminCommunication() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Toutes les annonces
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (announcementsError) throw announcementsError;

      // Profils pour les notifications ciblées
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('role', 'admin');

      if (profilesError) throw profilesError;

      setAnnouncements(announcementsData || []);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Erreur fetchAdminCommunication:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createAnnouncement = async (data: AnnouncementForm) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('announcements').insert({
        title: data.title,
        message: data.message,
        type: data.type,
        target: data.target,
        target_user_id: data.target === 'specific' ? data.target_user_id : null,
        expires_at: data.expires_at || null,
        is_active: true,
        created_by: userData.user?.id
      });

      if (error) throw error;
      
      await supabase.from('audit_logs').insert({
        user_id: userData.user?.id,
        action: 'announcement.created',
        entity_type: 'announcement',
        entity_id: 'new',
        metadata: { title: data.title }
      });

      await fetchData();
    } catch (error) {
      console.error('Erreur createAnnouncement:', error);
      throw error;
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Erreur updateAnnouncement:', error);
      throw error;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Erreur deleteAnnouncement:', error);
      throw error;
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const announcement = announcements.find(a => a.id === id);
      
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !current })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: userData.user?.id,
        action: 'announcement.toggled',
        entity_type: 'announcement',
        entity_id: id,
        metadata: { title: announcement?.title, is_active: !current }
      });

      await fetchData();
    } catch (error) {
      console.error('Erreur toggleActive:', error);
      throw error;
    }
  };

  return {
    announcements,
    profiles,
    loading,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleActive,
    refetch: fetchData
  };
}

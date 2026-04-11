import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useAdminPlatform() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Utiliser l'API publique pour éviter les problèmes de RLS en lecture
      const response = await fetch('/api/settings-public');
      if (!response.ok) throw new Error('Erreur lors de la récupération des paramètres');
      
      const settingsMap = await response.json();
      setSettings(settingsMap);
    } catch (err) {
      console.error('Erreur fetchSettings:', err);
      // Fallback sur Supabase au cas où
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*');
        if (!error && data) {
          const settingsMap = (data || []).reduce((acc, s) => ({
            ...acc,
            [s.key]: s.value
          }), {} as Record<string, string>);
          setSettings(settingsMap);
        }
      } catch (e) {
        console.error('Fallback fetchSettings failed:', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/update-setting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erreur lors de la mise à jour');
      }

      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error('Erreur updateSetting:', err);
      throw err;
    }
  };

  return { settings, loading, updateSetting, refetch: fetchSettings };
}

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
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
        
      if (error) throw error;
      
      if (data) {
        const settingsMap = data.reduce((acc, s) => ({
          ...acc,
          [s.key]: s.value
        }), {} as Record<string, string>);
        setSettings(settingsMap);
      }
    } catch (err) {
      console.error('Erreur fetchSettings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: string, value: string) => {
    try {
      if (!user) throw new Error("Utilisateur non connecté");
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

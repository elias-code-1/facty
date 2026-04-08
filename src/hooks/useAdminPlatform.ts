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

      const settingsMap = (data || []).reduce((acc, s) => ({
        ...acc,
        [s.key]: s.value
      }), {} as Record<string, string>);

      setSettings(settingsMap);
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
      const oldValue = settings[key];
      
      const { error } = await supabase
        .from('platform_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'platform.setting_updated',
        entity_type: 'platform_setting',
        metadata: { key, old_value: oldValue, new_value: value }
      });
    } catch (err) {
      console.error('Erreur updateSetting:', err);
      throw err;
    }
  };

  return { settings, loading, updateSetting, refetch: fetchSettings };
}

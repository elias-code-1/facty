import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

export function useAdminLanding() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landing_page_content')
        .select('key, value, type');

      if (error) throw error;

      if (data) {
        const parsedContent = data.reduce((acc, item) => ({
          ...acc,
          [item.key]: item.type === 'json' ? JSON.parse(item.value) : item.value
        }), {} as Record<string, any>);
        setContent(parsedContent);
      }
    } catch (error) {
      console.error('Error fetching admin landing content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const updateContent = async (key: string, value: string) => {
    try {
      // Check if key exists
      const { data: existing, error: fetchError } = await supabase
        .from('landing_page_content')
        .select('key')
        .eq('key', key)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        const { error } = await supabase
          .from('landing_page_content')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      } else {
        const type = (value.startsWith('[') || value.startsWith('{')) ? 'json' : 'text';
        const { error } = await supabase
          .from('landing_page_content')
          .insert({ key, value, type });
        if (error) throw error;
      }

      // Clear public cache so changes are visible immediately
      localStorage.removeItem('facty_landing_content');

      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        user_id: userData.user?.id,
        action: 'landing.content_updated',
        entity_type: 'landing_content',
        entity_id: key,
        metadata: { key }
      });

      await fetchContent();
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const uploadImage = async (key: string, file: File) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) throw new Error('Utilisateur non connecté');

      let fileToUpload = file;
      
      // Only compress if file is larger than 300KB to save time
      if (file.size > 300 * 1024) {
        const options = {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: false,
          initialQuality: 0.8,
          fileType: 'image/webp'
        };
        fileToUpload = await imageCompression(file, options);
      }
      
      const ext = fileToUpload.name.split('.').pop() || 'webp';
      const fileName = `landing-${key}-${Date.now()}.${ext}`;
      // Use user ID in path to satisfy standard Supabase RLS policies
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('landing')
        .upload(filePath, fileToUpload, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('landing')
        .getPublicUrl(filePath);

      await updateContent(key, publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  return {
    content,
    loading,
    updateContent,
    uploadImage,
    refetch: fetchContent
  };
}

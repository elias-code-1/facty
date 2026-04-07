import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';
import { User } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

/** Hook pour récupérer et gérer le profil utilisateur */
export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;
      
      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'profile.updated',
        entity_type: 'profile',
        entity_id: user.id,
        metadata: { fields: Object.keys(data) }
      });

      await fetchProfile();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      throw err;
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    // Validation avant compression
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Format non supporté. Utilisez PNG, JPG ou WebP');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Le fichier est trop volumineux (max 10MB)');
    }
    
    try {
      setLoading(true);
      
      // Compression avant upload
      const compressionOptions = {
        maxSizeMB: 0.05,          // max 50KB
        maxWidthOrHeight: 400,    // suffisant pour un logo
        useWebWorker: true,       // non-bloquant
        fileType: 'image/webp',   // meilleur ratio qualité/taille
        initialQuality: 0.80      // 80% qualité suffisant
      };

      let fileToUpload: File = file;

      try {
        const compressed = await imageCompression(file, compressionOptions);
        fileToUpload = compressed;
      } catch {
        // Si compression échoue → upload original
        fileToUpload = file;
      }
      
      // 1. Supprimer l'ancien logo s'il existe (peu importe l'extension)
      // On liste les fichiers dans le dossier de l'utilisateur
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('logos')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        const pathsToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('logos').remove(pathsToDelete);
      }

      // Upload vers Supabase Storage
      const path = `${user.id}/logo.webp`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, fileToUpload, {
          upsert: true,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(path);

      // Ajouter un timestamp pour éviter le cache navigateur
      const finalUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Mettre à jour le profil
      await updateProfile({ logo_url: finalUrl });

      return finalUrl;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLogo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Lister et supprimer tout ce qui se trouve dans le dossier de l'utilisateur
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('logos')
        .list(user.id);

      if (listError) {
        console.warn('Erreur lors de la liste des fichiers existants:', listError);
      }

      if (existingFiles && existingFiles.length > 0) {
        const pathsToDelete = existingFiles.map(f => `${user.id}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('logos')
          .remove(pathsToDelete);
        
        if (deleteError) {
          console.error('Détails erreur Storage (Delete):', deleteError);
          throw deleteError;
        }
      }

      await updateProfile({ logo_url: null });
    } catch (err) {
      console.error('Erreur lors de la suppression du logo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      // On ne met loading à true que si on n'a pas encore de profil ou si l'ID utilisateur a changé
      if (isMounted && (!profile || profile.id !== user.id)) {
        setLoading(true);
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (isMounted) {
          if (error) {
            console.error('Erreur profil:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Erreur profil catch:', err);
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [user?.id]); // On dépend de l'ID plutôt que de l'objet utilisateur complet

  return { profile, loading, updateProfile, uploadLogo, deleteLogo, refetch: fetchProfile };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types/database';
import { User } from '@supabase/supabase-js';

export interface ClientWithCount extends Client {
  invoices: { count: number }[];
}

/** Hook CRUD pour la gestion des clients */
export function useClients(user: User | null) {
  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*, invoices(count)')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data as unknown as ClientWithCount[]);
    } catch (err) {
      console.error('Erreur lors de la récupération des clients:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createClient = async (data: Omit<Client, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;
    try {
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'client.created',
        entity_type: 'client',
        entity_id: newClient.id,
        metadata: { client_name: newClient.name, client_id: newClient.id }
      });

      await fetchClients();
      return newClient;
    } catch (err) {
      console.error('Erreur lors de la création du client:', err);
      throw err;
    }
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    if (!user) return;
    try {
      const { data: updatedClient, error } = await supabase
        .from('clients')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'client.updated',
        entity_type: 'client',
        entity_id: id,
        metadata: { client_name: updatedClient.name, client_id: id }
      });

      await fetchClients();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du client:', err);
      throw err;
    }
  };

  const deleteClient = async (id: string) => {
    if (!user) return;
    try {
      // On récupère le nom avant suppression pour le log
      const clientToDelete = clients.find(c => c.id === id);
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'client.deleted',
        entity_type: 'client',
        entity_id: id,
        metadata: { client_name: clientToDelete?.name, client_id: id }
      });

      await fetchClients();
    } catch (err) {
      console.error('Erreur lors de la suppression du client:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, createClient, updateClient, deleteClient, refetch: fetchClients };
}

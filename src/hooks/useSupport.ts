import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'read' | 'resolved';
  created_at: string;
}

export function useSupport(isAdmin = false) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();

      const channel = supabase
        .channel(`support_tickets_changes_${Math.random().toString(36).substring(7)}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'support_tickets'
        }, (payload) => {
          setTickets(prev => [payload.new as SupportTicket, ...prev]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, fetchTickets]);

  const submitTicket = async (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    try {
      const { error: ticketError } = await supabase
        .from('support_tickets')
        .insert(data);

      if (ticketError) throw ticketError;

      // Notification admin
      await supabase.from('admin_notifications').insert({
        type: 'critical_error',
        message: `Nouveau message de ${data.name} : ${data.subject}`,
        metadata: { email: data.email, subject: data.subject }
      });

    } catch (error) {
      console.error('Error submitting ticket:', error);
      throw error;
    }
  };

  const updateStatus = async (id: string, status: SupportTicket['status']) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  };

  return {
    tickets,
    loading,
    submitTicket,
    updateStatus,
    refetch: fetchTickets
  };
}

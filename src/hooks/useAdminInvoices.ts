import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice, Client, Profile } from '../types/database';
import { useAuth } from './useAuth';

export type AdminInvoice = Invoice & {
  client: Client | null;
  owner: {
    id: string;
    full_name: string;
    email: string;
    company_name: string;
  } | null;
};

/** Hook pour la gestion globale des factures par l'administrateur */
export function useAdminInvoices() {
  const { user: currentUser } = useAuth();
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);

      // Requête 1 : toutes les factures
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Requête 2 : tous les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Requête 3 : tous les profils (pour nom du user)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_name')
        .neq('role', 'admin');

      if (profilesError) throw profilesError;

      // Combiner manuellement
      const combined: AdminInvoice[] = (invoicesData || []).map(inv => ({
        ...inv,
        client: (clientsData || []).find(c => c.id === inv.client_id) ?? null,
        owner: (profilesData || []).find(p => p.id === inv.user_id) ?? null
      }));

      setInvoices(combined);
    } catch (err) {
      console.error('Erreur lors du fetch des factures admin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const deleteInvoice = async (id: string) => {
    try {
      const invoiceToDelete = invoices.find(i => i.id === id);
      if (!invoiceToDelete) throw new Error("Facture non trouvée");

      // 1. Supprimer invoice_items d'abord
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (itemsError) throw itemsError;

      // 2. Puis supprimer invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      // 3. Logger l'action
      await supabase.from('audit_logs').insert({
        user_id: currentUser?.id,
        action: 'invoice.deleted',
        entity_type: 'invoice',
        entity_id: id,
        metadata: { 
          invoice_number: invoiceToDelete.invoice_number, 
          deleted_by: 'admin' 
        }
      });

      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Erreur deleteInvoice:', err);
      throw err;
    }
  };

  return {
    invoices,
    loading,
    deleteInvoice,
    refetch: fetchInvoices
  };
}

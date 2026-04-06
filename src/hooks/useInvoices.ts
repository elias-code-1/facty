import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice, InvoiceItem, Client, InvoiceStatus } from '../types/database';
import { User } from '@supabase/supabase-js';
import { calculateTotals } from '../utils/invoice';

export type InvoiceFormData = Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'subtotal' | 'tax_amount' | 'total'>;
export type InvoiceItemFormData = Omit<InvoiceItem, 'id' | 'invoice_id'>;

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  clients: Client;
}

/** Hook CRUD pour la gestion des factures */
export function useInvoices(user: User | null) {
  const [invoices, setInvoices] = useState<(Invoice & { clients: any })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des factures:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createInvoice = async (data: InvoiceFormData, items: InvoiceItemFormData[]): Promise<string> => {
    if (!user) throw new Error('Utilisateur non connecté');

    try {
      // 0. Vérifier l'unicité du numéro
      const isUnique = await checkInvoiceNumberUnique(data.invoice_number);
      if (!isUnique) {
        throw new Error(`Le numéro de facture ${data.invoice_number} est déjà utilisé.`);
      }

      const { subtotal, tax_amount, total } = calculateTotals(items, data.tax_rate);

      // 1. Insérer la facture
      const { data: insertedInvoices, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          ...data,
          user_id: user.id,
          subtotal,
          tax_amount,
          total
        }])
        .select();

      if (invoiceError) {
        console.error('Erreur Supabase (invoices):', invoiceError);
        throw new Error(`Erreur lors de la création de la facture: ${invoiceError.message}`);
      }

      const newInvoice = insertedInvoices?.[0];
      if (!newInvoice) {
        throw new Error('Erreur lors de la création de la facture (aucune donnée retournée par le serveur).');
      }

      // 2. Insérer les items (seulement s'il y en a)
      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          ...item,
          invoice_id: newInvoice.id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Erreur Supabase (invoice_items):', itemsError);
          // On pourrait envisager de supprimer la facture ici si les items échouent, 
          // mais Supabase ne gère pas les transactions complexes facilement via le client JS sans RPC.
          throw new Error(`Erreur lors de l'ajout des articles: ${itemsError.message}`);
        }
      }

      // 3. Log audit (non bloquant)
      supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'invoice.created',
        entity_type: 'invoice',
        entity_id: newInvoice.id,
        metadata: { 
          invoice_number: newInvoice.invoice_number, 
          client_id: newInvoice.client_id, 
          total 
        }
      }).then(({ error }) => {
        if (error) console.warn('Audit log failed:', error);
      });

      await fetchInvoices();
      return newInvoice.id;
    } catch (err) {
      console.error('Erreur détaillée createInvoice:', err);
      throw err;
    }
  };

  const checkInvoiceNumberUnique = async (invoiceNumber: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { count, error } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('invoice_number', invoiceNumber);
      
      if (error) throw error;
      return count === 0;
    } catch (err) {
      console.error('Erreur lors de la vérification du numéro de facture:', err);
      return false;
    }
  };

  const getNextInvoiceNumber = async (): Promise<string> => {
    if (!user) return 'INV-001';
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return 'INV-001';
      
      const lastNumber = data[0].invoice_number;
      const match = lastNumber.match(/\d+$/);
      const nextVal = match ? parseInt(match[0], 10) + 1 : 1;
      
      return `INV-${String(nextVal).padStart(3, '0')}`;
    } catch (err) {
      console.error('Erreur lors de la génération du prochain numéro:', err);
      return 'INV-001';
    }
  };

  const updateInvoice = async (id: string, data: Partial<Invoice>, items: InvoiceItemFormData[]) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    // Vérifier si la facture est verrouillée
    const currentInvoice = invoices.find(inv => inv.id === id);
    if (currentInvoice && (currentInvoice.status === 'paid' || currentInvoice.status === 'cancelled')) {
      throw new Error('Cette facture est verrouillée et ne peut plus être modifiée.');
    }

    try {
      const { subtotal, tax_amount, total } = calculateTotals(items, data.tax_rate || 0);

      // 1. Mettre à jour la facture
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          ...data,
          subtotal,
          tax_amount,
          total
        })
        .eq('id', id);

      if (invoiceError) throw invoiceError;

      // 2. Mettre à jour les items (Supprimer puis ré-insérer pour simplifier)
      // Note: Dans une vraie app, on ferait un diff ou on utiliserait une transaction RPC
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      if (deleteError) throw deleteError;

      if (items.length > 0) {
        const itemsToInsert = items.map(item => ({
          ...item,
          invoice_id: id
        }));

        const { error: insertError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      // 3. Log audit
      supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'invoice.updated',
        entity_type: 'invoice',
        entity_id: id,
        metadata: { 
          invoice_number: data.invoice_number || currentInvoice?.invoice_number,
          total 
        }
      }).then(({ error }) => {
        if (error) console.warn('Audit log failed:', error);
      });

      await fetchInvoices();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la facture:', err);
      throw err;
    }
  };

  const updateStatus = async (id: string, status: InvoiceStatus) => {
    if (!user) return;
    
    // Vérifier si la facture est déjà verrouillée
    const currentInvoice = invoices.find(inv => inv.id === id);
    if (currentInvoice && (currentInvoice.status === 'paid' || currentInvoice.status === 'cancelled')) {
      throw new Error('Cette facture est verrouillée (payée ou annulée) et ne peut plus être modifiée.');
    }
    
    // Mise à jour optimiste locale
    const oldInvoices = [...invoices];
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Log audit (on peut le faire de manière asynchrone sans bloquer)
      supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'invoice.status_changed',
        entity_type: 'invoice',
        entity_id: id,
        metadata: { to: status }
      }).then(({ error }) => {
        if (error) console.warn('Erreur lors du log audit:', error);
      });

      // On refetch pour être sûr d'avoir les données à jour (relations, etc.)
      await fetchInvoices();
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
      // Rollback en cas d'erreur
      setInvoices(oldInvoices);
      throw err;
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user) return;

    // Vérifier si la facture est verrouillée
    const currentInvoice = invoices.find(inv => inv.id === id);
    if (currentInvoice && (currentInvoice.status === 'paid' || currentInvoice.status === 'cancelled')) {
      throw new Error('Cette facture est verrouillée et ne peut plus être supprimée.');
    }

    try {
      const { data: invoiceToDelete } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'invoice.deleted',
        entity_type: 'invoice',
        entity_id: id,
        metadata: { invoice_number: invoiceToDelete?.invoice_number }
      });

      await fetchInvoices();
    } catch (err) {
      console.error('Erreur lors de la suppression de la facture:', err);
      throw err;
    }
  };

  const getInvoiceWithItems = useCallback(async (id: string): Promise<InvoiceWithItems> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*), clients(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Facture introuvable');
      
      return data as InvoiceWithItems;
    } catch (err) {
      console.error('Erreur lors de la récupération des détails de la facture:', err);
      throw err;
    }
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { 
    invoices, 
    loading, 
    createInvoice, 
    updateInvoice, 
    deleteInvoice, 
    updateStatus, 
    getInvoiceWithItems, 
    checkInvoiceNumberUnique,
    getNextInvoiceNumber,
    refetch: fetchInvoices 
  };
}

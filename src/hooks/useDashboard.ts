import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Invoice, Client } from '../types/database';
import { User } from '@supabase/supabase-js';

export interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  pendingAmount: number;
  invoicesThisMonth: number;
  revenueThisMonth: number;
  statusBreakdown: {
    draft: number;
    sent: number;
    paid: number;
    cancelled: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
    invoices: number;
  }[];
  recentInvoices: (Invoice & { clients: { name: string } | null })[];
  loading: boolean;
}

const MONTH_LABELS = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

/** Hook pour calculer les statistiques du dashboard */
export function useDashboard(user: User | null) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<(Invoice & { clients: { name: string } | null })[]>([]);
  const [totalClients, setTotalClients] = useState(0);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, clients(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      
      setInvoices(invoicesRes.data || []);
      setTotalClients(clientsRes.count || 0);
    } catch (err) {
      console.error('Erreur dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalInvoices = invoices.length;
    let totalRevenue = 0;
    let pendingAmount = 0;
    let invoicesThisMonth = 0;
    let revenueThisMonth = 0;

    const statusBreakdown = {
      draft: 0,
      sent: 0,
      paid: 0,
      cancelled: 0
    };

    // Initialisation des 6 derniers mois
    const last6Months: { [key: string]: { revenue: number, invoices: number, order: number } } = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      const key = `${year}-${monthIdx}`;
      last6Months[key] = {
        month: MONTH_LABELS[monthIdx],
        revenue: 0,
        invoices: 0,
        order: 5 - i
      } as any;
    }

    invoices.forEach(inv => {
      const invDate = new Date(inv.created_at);
      const isThisMonth = invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;

      // Stats par statut
      if (inv.status === 'paid') {
        totalRevenue += inv.total;
        if (isThisMonth) revenueThisMonth += inv.total;
      } else if (inv.status === 'sent') {
        pendingAmount += inv.total;
      }

      if (isThisMonth) invoicesThisMonth++;

      statusBreakdown[inv.status]++;

      // Graphe revenus (6 derniers mois)
      const mKey = `${invDate.getFullYear()}-${invDate.getMonth()}`;
      if (last6Months[mKey]) {
        last6Months[mKey].invoices++;
        if (inv.status === 'paid') {
          last6Months[mKey].revenue += inv.total;
        }
      }
    });

    const revenueByMonth = Object.values(last6Months)
      .sort((a, b) => (a as any).order - (b as any).order)
      .map(m => ({
        month: (m as any).month,
        revenue: m.revenue,
        invoices: m.invoices
      }));

    return {
      totalInvoices,
      totalClients,
      totalRevenue,
      pendingAmount,
      invoicesThisMonth,
      revenueThisMonth,
      statusBreakdown,
      revenueByMonth,
      recentInvoices: invoices.slice(0, 5),
      loading
    };
  }, [invoices, totalClients, loading]);

  return stats;
}

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Invoice, AuditLog } from '../types/database';

export interface RetentionData {
  month: string;
  registered: number;
  returned: number;
  rate: number;
}

export interface FunnelData {
  registered: number;
  hasProfile: number;
  firstInvoice: number;
  fiveInvoices: number;
  tenInvoices: number;
}

export interface HeatmapData {
  day: number;
  hour: number;
  count: number;
}

export interface InactiveUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  last_seen_at: string | null;
  daysSinceLastSeen: number;
  invoiceCount: number;
}

/** Hook pour les statistiques avancées de Business Intelligence */
export function useAdminStats() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profiles: Profile[];
    invoices: Invoice[];
    logs: AuditLog[];
  }>({
    profiles: [],
    invoices: [],
    logs: []
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // 1. Profils non-admin
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('role', 'admin');

        // 2. Toutes les factures
        const { data: invoices } = await supabase
          .from('invoices')
          .select('*');

        // 3. Tous les logs
        const { data: logs } = await supabase
          .from('audit_logs')
          .select('user_id, action, created_at')
          .order('created_at', { ascending: false });

        setData({
          profiles: profiles || [],
          invoices: invoices || [],
          logs: logs || []
        });
      } catch (error) {
        console.error('Erreur fetchAdminStats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const { profiles, invoices, logs } = data;
    if (profiles.length === 0) return null;

    // --- 1. Métriques générales ---
    const totalUsers = profiles.length;
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    const avgInvoicesPerUser = totalInvoices / totalUsers;
    const avgRevenuePerUser = totalRevenue / totalUsers;

    // Délai première facture
    let totalDaysToFirst = 0;
    let usersWithInvoices = 0;

    profiles.forEach(profile => {
      const userInvoices = invoices
        .filter(inv => inv.user_id === profile.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      if (userInvoices.length > 0) {
        const regDate = new Date(profile.created_at);
        const firstInvDate = new Date(userInvoices[0].created_at);
        const diffDays = Math.max(0, Math.floor((firstInvDate.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24)));
        totalDaysToFirst += diffDays;
        usersWithInvoices++;
      }
    });

    const avgDaysToFirstInvoice = usersWithInvoices > 0 ? Math.round(totalDaysToFirst / usersWithInvoices) : 0;

    // --- 2. Funnel d'activation ---
    const funnel: FunnelData = {
      registered: totalUsers,
      hasProfile: profiles.filter(p => p.company_name && p.address).length,
      firstInvoice: usersWithInvoices,
      fiveInvoices: profiles.filter(p => invoices.filter(inv => inv.user_id === p.id).length >= 5).length,
      tenInvoices: profiles.filter(p => invoices.filter(inv => inv.user_id === p.id).length >= 10).length
    };

    // --- 3. Rétention mensuelle ---
    const retention: RetentionData[] = [];
    const months: string[] = [];
    
    // On récupère les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    months.forEach((monthStr, index) => {
      const [year, month] = monthStr.split('-').map(Number);
      const registeredThisMonth = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });

      if (registeredThisMonth.length > 0) {
        // Mois suivant
        const nextMonthDate = new Date(year, month, 1); // month est déjà 0-indexed + 1, donc c'est le mois suivant
        const nextYear = nextMonthDate.getFullYear();
        const nextMonth = nextMonthDate.getMonth() + 1;

        const returned = registeredThisMonth.filter(p => {
          return logs.some(log => {
            const d = new Date(log.created_at);
            return log.user_id === p.id && d.getFullYear() === nextYear && (d.getMonth() + 1) === nextMonth;
          });
        }).length;

        retention.push({
          month: monthStr,
          registered: registeredThisMonth.length,
          returned,
          rate: Math.round((returned / registeredThisMonth.length) * 100)
        });
      }
    });

    // --- 4. Heatmap d'activité ---
    const heatmapMap = new Map<string, number>();
    logs.forEach(log => {
      const date = new Date(log.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
    });

    const heatmap: HeatmapData[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        heatmap.push({
          day: d,
          hour: h,
          count: heatmapMap.get(`${d}-${h}`) || 0
        });
      }
    }

    // --- 5. Users inactifs ---
    const now = new Date();
    const inactiveUsers: InactiveUser[] = profiles
      .map(p => {
        const lastSeen = p.last_seen_at ? new Date(p.last_seen_at) : new Date(p.created_at);
        const diffDays = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          created_at: p.created_at,
          last_seen_at: p.last_seen_at,
          daysSinceLastSeen: diffDays,
          invoiceCount: invoices.filter(inv => inv.user_id === p.id).length
        };
      })
      .filter(u => u.daysSinceLastSeen >= 7)
      .sort((a, b) => b.daysSinceLastSeen - a.daysSinceLastSeen);

    return {
      retention,
      funnel,
      heatmap,
      inactiveUsers,
      avgInvoicesPerUser,
      avgRevenuePerUser,
      avgDaysToFirstInvoice
    };
  }, [data]);

  return {
    ...stats,
    loading
  };
}

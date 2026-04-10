import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AuditLog, AdminNotification, Profile, Invoice } from '../types/database';

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  totalTeamMembers: number;

  totalInvoices: number;
  totalRevenue: number;
  invoicesToday: number;
  invoicesThisMonth: number;
  pendingAmount: number;

  usersGrowthByMonth: {
    month: string;
    total: number;
    new: number;
  }[];

  invoicesByMonth: {
    month: string;
    count: number;
    revenue: number;
  }[];

  statusDistribution: {
    draft: number;
    sent: number;
    paid: number;
    cancelled: number;
  };

  topUsers: {
    id: string;
    name: string;
    email: string;
    count: number;
    revenue: number;
    since: string;
  }[];

  recentLogs: (AuditLog & {
    profiles: { full_name: string; email: string } | null;
  })[];

  unreadNotifications: AdminNotification[];
  loading: boolean;
}

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<{
    profiles: Pick<Profile, 'id' | 'created_at' | 'is_suspended' | 'role' | 'full_name' | 'email'>[];
    teamMembers: any[];
    invoices: Pick<Invoice, 'id' | 'total' | 'status' | 'created_at' | 'user_id'>[];
    logs: (AuditLog & { profiles: { full_name: string; email: string } | null })[];
    notifications: AdminNotification[];
  }>({
    profiles: [],
    teamMembers: [],
    invoices: [],
    logs: [],
    notifications: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members via API to bypass RLS
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      let teamMembersData = [];
      
      if (token) {
        try {
          const response = await fetch('/api/get-team-members', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            teamMembersData = data.members || [];
          }
        } catch (e) {
          console.error('Error fetching team members for dashboard:', e);
        }
      }

      const [
        profilesRes,
        invoicesRes,
        logsRes,
        notificationsRes
      ] = await Promise.all([
        supabase.from('profiles')
          .select('id, created_at, is_suspended, role, full_name, email')
          .neq('role', 'admin')
          .is('team_role', null),

        supabase.from('invoices')
          .select('id, total, status, created_at, user_id'),

        supabase.from('audit_logs')
          .select('*, profiles(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(10),

        supabase.from('admin_notifications')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
      ]);

      setRawData({
        profiles: profilesRes.data || [],
        teamMembers: teamMembersData,
        invoices: invoicesRes.data || [],
        logs: (logsRes.data as any) || [],
        notifications: notificationsRes.data || [],
      });
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Users stats
    const totalUsers = rawData.profiles.length;
    const activeUsers = rawData.profiles.filter(p => !p.is_suspended).length;
    const suspendedUsers = rawData.profiles.filter(p => p.is_suspended).length;
    const newUsersToday = rawData.profiles.filter(p => new Date(p.created_at) >= today).length;
    const newUsersThisMonth = rawData.profiles.filter(p => new Date(p.created_at) >= firstDayOfMonth).length;
    const totalTeamMembers = rawData.teamMembers.length;

    // Invoices stats
    const totalInvoices = rawData.invoices.length;
    const totalRevenue = rawData.invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);
    const invoicesToday = rawData.invoices.filter(i => new Date(i.created_at) >= today).length;
    const invoicesThisMonth = rawData.invoices.filter(i => new Date(i.created_at) >= firstDayOfMonth).length;
    const pendingAmount = rawData.invoices
      .filter(i => i.status === 'sent')
      .reduce((sum, i) => sum + i.total, 0);

    // Status distribution
    const statusDistribution = {
      draft: rawData.invoices.filter(i => i.status === 'draft').length,
      sent: rawData.invoices.filter(i => i.status === 'sent').length,
      paid: rawData.invoices.filter(i => i.status === 'paid').length,
      cancelled: rawData.invoices.filter(i => i.status === 'cancelled').length,
    };

    // Helper for months (last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        month: d.toLocaleString('fr-FR', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
      };
    }).reverse();

    // Users growth by month
    const usersGrowthByMonth = last6Months.map(m => {
      const newInMonth = rawData.profiles.filter(p => {
        const d = new Date(p.created_at);
        return d.getMonth() === m.monthNum && d.getFullYear() === m.year;
      }).length;
      
      const totalAtEnd = rawData.profiles.filter(p => {
        const d = new Date(p.created_at);
        const endOfMonth = new Date(m.year, m.monthNum + 1, 0);
        return d <= endOfMonth;
      }).length;

      return {
        month: m.month,
        total: totalAtEnd,
        new: newInMonth,
      };
    });

    // Invoices by month
    const invoicesByMonth = last6Months.map(m => {
      const inMonth = rawData.invoices.filter(i => {
        const d = new Date(i.created_at);
        return d.getMonth() === m.monthNum && d.getFullYear() === m.year;
      });

      return {
        month: m.month,
        count: inMonth.length,
        revenue: inMonth.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
      };
    });

    // Top users calculation
    const userStatsMap = new Map<string, { count: number; revenue: number }>();
    rawData.invoices.forEach(inv => {
      const current = userStatsMap.get(inv.user_id) || { count: 0, revenue: 0 };
      userStatsMap.set(inv.user_id, {
        count: current.count + 1,
        revenue: current.revenue + (inv.status === 'paid' ? inv.total : 0)
      });
    });

    const topUsers = rawData.profiles
      .map(profile => {
        const stats = userStatsMap.get(profile.id) || { count: 0, revenue: 0 };
        return {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          count: stats.count,
          revenue: stats.revenue,
          since: profile.created_at
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
      .slice(0, 5);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday,
      newUsersThisMonth,
      totalTeamMembers,
      totalInvoices,
      totalRevenue,
      invoicesToday,
      invoicesThisMonth,
      pendingAmount,
      usersGrowthByMonth,
      invoicesByMonth,
      statusDistribution,
      topUsers,
      recentLogs: rawData.logs,
      unreadNotifications: rawData.notifications,
    };
  }, [rawData]);

  return {
    ...stats,
    loading,
    refetch: fetchData,
  };
}

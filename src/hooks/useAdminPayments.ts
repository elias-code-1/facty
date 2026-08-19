import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  transaction_id: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export interface AdminPaymentsData {
  revenuTotal: number;
  revenuCeMois: number;
  revenuAujourdhui: number;
  nombreTransactions: number;
  panierMoyen: number;
  tauxConversion: number;
  revenuParMois: {
    month: string;
    revenue: number;
    count: number;
  }[];
  transactions: PaymentTransaction[];
  loading: boolean;
}

export function useAdminPayments() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<{
    transactions: PaymentTransaction[];
    profiles: Pick<Profile, 'id' | 'role' | 'is_premium'>[];
  }>({
    transactions: [],
    profiles: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [transactionsRes, profilesRes] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            id, user_id, amount, currency, transaction_id, status, created_at,
            profiles ( full_name, email )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, role, is_premium')
          .neq('role', 'admin')
          .is('team_role', null)
      ]);

      setRawData({
        transactions: transactionsRes.data || [],
        profiles: profilesRes.data || [],
      });
    } catch (err) {
      console.error('Error fetching admin payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const data = useMemo<AdminPaymentsData>(() => {
    const { transactions, profiles } = rawData;
    
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const successTransactions = transactions.filter(t => t.status.toLowerCase() === 'success');
    
    const revenuTotal = successTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const nombreTransactions = successTransactions.length;
    const panierMoyen = nombreTransactions > 0 ? revenuTotal / nombreTransactions : 0;

    let revenuCeMois = 0;
    let revenuAujourdhui = 0;

    successTransactions.forEach(t => {
      const time = new Date(t.created_at).getTime();
      if (time >= startOfMonth) revenuCeMois += t.amount;
      if (time >= startOfDay) revenuAujourdhui += t.amount;
    });

    const conversionProfiles = profiles;
    const premiumCount = conversionProfiles.filter(p => p.is_premium).length;
    const tauxConversion = conversionProfiles.length > 0 ? (premiumCount / conversionProfiles.length) * 100 : 0;

    // Revenu par mois (12 derniers mois)
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const revenuParMois = [];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      
      const monthTx = successTransactions.filter(t => {
        const tDate = new Date(t.created_at);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
      });
      
      const rev = monthTx.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      revenuParMois.push({
        month: `${monthNames[month]} ${year.toString().slice(-2)}`,
        revenue: rev,
        count: monthTx.length,
      });
    }

    return {
      revenuTotal,
      revenuCeMois,
      revenuAujourdhui,
      nombreTransactions,
      panierMoyen,
      tauxConversion,
      revenuParMois,
      transactions,
      loading
    };
  }, [rawData, loading]);

  return { ...data, refetch: fetchData };
}

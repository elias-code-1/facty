import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

import { isPremiumActive } from '../utils/premium';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  transaction_id: string;
  status: string;
  payment_method?: string;
  country?: string;
  fees?: number;
  failure_reason?: string;
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
  tauxEchec: number;
  fraisTotal: number;
  repartitionMethodePaiement: Record<string, number>;
  repartitionPays: Record<string, number>;
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
    profiles: Pick<Profile, 'id' | 'role' | 'is_premium' | 'premium_expires_at'>[];
  }>({
    transactions: [],
    profiles: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch payments without the inner join
      const transactionsRes = await supabase
        .from('payments')
        .select('id, user_id, amount, currency, transaction_id, status, payment_method, country, fees, failure_reason, created_at')
        .order('created_at', { ascending: false });

      if (transactionsRes.error) {
        console.error('Erreur Supabase lors de la récupération des paiements:', transactionsRes.error);
      }

      const rawPayments = transactionsRes.data || [];

      // 2. Extract unique user_ids
      const userIds = [...new Set(rawPayments.map(p => p.user_id).filter(Boolean))];
      
      let profilesMap = new Map();

      // 3. Fetch specific profiles for the payments
      if (userIds.length > 0) {
        const paymentProfilesRes = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
          
        if (paymentProfilesRes.error) {
          console.error('Erreur Supabase lors de la récupération des profils liés aux paiements:', paymentProfilesRes.error);
        }
        
        const paymentProfiles = paymentProfilesRes.data || [];
        paymentProfiles.forEach(p => {
          profilesMap.set(p.id, { full_name: p.full_name, email: p.email });
        });
      }

      // 4. Merge payment data with profile data
      const transactions = rawPayments.map(p => ({
        ...p,
        profiles: profilesMap.get(p.user_id) || null
      })) as unknown as PaymentTransaction[];

      // 5. Fetch all standard profiles for conversion rate calculation
      const profilesRes = await supabase
        .from('profiles')
        .select('id, role, is_premium, premium_expires_at')
        .neq('role', 'admin')
        .is('team_role', null);

      if (profilesRes.error) {
        console.error('Erreur Supabase lors de la récupération des profils globaux:', profilesRes.error);
      }

      setRawData({
        transactions,
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
    const failedTransactions = transactions.filter(t => t.status.toLowerCase() === 'failed');
    
    const revenuTotal = successTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const nombreTransactions = successTransactions.length;
    const panierMoyen = nombreTransactions > 0 ? revenuTotal / nombreTransactions : 0;
    
    const totalDecided = failedTransactions.length + successTransactions.length;
    const tauxEchec = totalDecided > 0 ? (failedTransactions.length / totalDecided) * 100 : 0;
    
    const fraisTotal = successTransactions.reduce((sum, t) => sum + (t.fees || 0), 0);

    const repartitionMethodePaiement = successTransactions.reduce((acc, t) => {
      const method = t.payment_method || 'Inconnu';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repartitionPays = successTransactions.reduce((acc, t) => {
      const c = t.country || 'Inconnu';
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let revenuCeMois = 0;
    let revenuAujourdhui = 0;

    successTransactions.forEach(t => {
      const time = new Date(t.created_at).getTime();
      if (time >= startOfMonth) revenuCeMois += t.amount;
      if (time >= startOfDay) revenuAujourdhui += t.amount;
    });

    const conversionProfiles = profiles;
    const premiumCount = conversionProfiles.filter(p => isPremiumActive(p)).length;
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
      tauxEchec,
      fraisTotal,
      repartitionMethodePaiement,
      repartitionPays,
      revenuParMois,
      transactions,
      loading
    };
  }, [rawData, loading]);

  return { ...data, refetch: fetchData };
}

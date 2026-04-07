import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CACHE_KEY = 'facty_feature_flags';
const CACHE_TTL = 60 * 1000; // 60 secondes

export function useFeatureFlags() {
  const [flags, setFlags] = useState({
    pdfExport: true,
    print: true,
    csvExport: true,
    clients: true,
    invoiceShare: false,
    recurring: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setFlags(data);
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase
          .from('platform_settings')
          .select('key, value')
          .like('key', 'feature_%');

        if (error) throw error;

        const newFlags = {
          pdfExport: data.find(s => s.key === 'feature_pdf_export')?.value === 'true',
          print: data.find(s => s.key === 'feature_print')?.value === 'true',
          csvExport: data.find(s => s.key === 'feature_csv_export')?.value === 'true',
          clients: data.find(s => s.key === 'feature_clients')?.value === 'true',
          invoiceShare: data.find(s => s.key === 'feature_invoice_share')?.value === 'true',
          recurring: data.find(s => s.key === 'feature_recurring')?.value === 'true'
        };

        setFlags(newFlags);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: newFlags, timestamp: Date.now() }));
      } catch (err) {
        console.error('Erreur fetchFeatureFlags:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlags();
  }, []);

  return { ...flags, loading };
}

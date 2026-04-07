import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CACHE_KEY = 'facty_landing_content';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const replaceInvoxa = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.replace(/Invoxa/g, 'Facty').replace(/invoxa/g, 'facty');
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceInvoxa);
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = replaceInvoxa(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export function useLanding() {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        // Check cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setContent(replaceInvoxa(data));
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase
          .from('landing_page_content')
          .select('key, value, type');

        if (error) throw error;

        if (data) {
          const parsedContent = data.reduce((acc, item) => ({
            ...acc,
            [item.key]: item.type === 'json' ? JSON.parse(item.value) : item.value
          }), {} as Record<string, any>);

          const cleanedContent = replaceInvoxa(parsedContent);

          setContent(cleanedContent);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: cleanedContent,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error fetching landing content:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { content, loading };
}

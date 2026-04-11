import { supabase } from '../lib/supabase';

export interface ContentBlock {
  type: string;
  content: string;
  order?: number;
}

export interface SEOPageData {
  slug: string;
  title: string;
  description: string;
  hero_title: string;
  hero_subtitle: string;
  category: string;
  content_blocks?: ContentBlock[];
}

export const seoService = {
  /**
   * Récupère une page SEO par son slug
   */
  async getPageBySlug(slug: string): Promise<SEOPageData | null> {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching SEO page:', error);
      return null;
    }
  },

  /**
   * Récupère toutes les routes SEO pour le sitemap ou le maillage interne
   */
  async getAllSlugs(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('slug')
        .eq('is_published', true);

      if (error) throw error;
      return data.map(item => item.slug);
    } catch (error) {
      console.error('Error fetching SEO slugs:', error);
      return [];
    }
  }
};

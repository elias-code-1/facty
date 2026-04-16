import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { SEO_PAGES } from '../src/data/seoPages'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Récupérer les pages publiées en base de données
    const { data: dbSeoPages, error } =
      await supabase
        .from('seo_pages')
        .select('slug, updated_at')
        .eq('is_published', true)

    if (error) {
      console.error('Sitemap error fetching DB pages:', error)
    }

    // Fusionner les pages locales (hardcoded) et les pages en base de données
    // On utilise un Map pour éviter les doublons de slugs
    const allSeoPagesMap = new Map<string, string | null>()

    // 1. Ajouter les pages locales (considérées comme publiées)
    SEO_PAGES.forEach(page => {
      allSeoPagesMap.set(page.slug, null)
    })

    // 2. Ajouter/Écraser avec les pages de la DB (qui ont une date de mise à jour)
    if (dbSeoPages) {
      dbSeoPages.forEach(page => {
        allSeoPagesMap.set(page.slug, page.updated_at)
      })
    }

    const seoPagesArray = Array.from(allSeoPagesMap.entries()).map(([slug, updated_at]) => ({
      slug,
      updated_at
    }))

    // Pages statiques fixes
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/auth', priority: '0.8', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/legal', priority: '0.5', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.5', changefreq: 'monthly' },
    ]

    const baseUrl = 'https://factyapp.logonova.site'
    const today = new Date().toISOString().split('T')[0]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${seoPagesArray.map(page => `  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${
      page.updated_at
        ? page.updated_at.split('T')[0]
        : today
    }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    )
    return res.status(200).send(xml)

  } catch (err) {
    console.error('Sitemap generation error:', err)
    return res.status(500).send(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
    )
  }
}

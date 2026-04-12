import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

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

    // Récupérer uniquement les pages publiées
    const { data: seoPages, error } =
      await supabase
        .from('seo_pages')
        .select('slug, updated_at')
        .eq('is_published', true)
        .order('created_at', {
          ascending: false
        })

    if (error) {
      console.error('Sitemap error:', error)
    }

    // Pages statiques fixes
    const staticPages = [
      {
        url: '/',
        priority: '1.0',
        changefreq: 'weekly'
      },
      {
        url: '/auth',
        priority: '0.8',
        changefreq: 'monthly'
      },
      {
        url: '/contact',
        priority: '0.7',
        changefreq: 'monthly'
      },
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
${(seoPages ?? []).map(page => `  <url>
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
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
    )
  }
}

interface SEOProps {
  title?: string
  description?: string
  url?: string
}

export const updateSEO = ({
  title,
  description,
  url
}: SEOProps) => {
  const appUrl = import.meta.env.VITE_APP_URL
    ?? 'https://facty.logonova.site'

  if (title) {
    document.title = `${title} — Facty`
  }

  if (description) {
    const meta = document.querySelector(
      'meta[name="description"]'
    )
    if (meta) meta.setAttribute('content', description)
  }
}

export default async (request: Request) => {
  const raw = Netlify.env.get('API_ORIGIN') || Netlify.env.get('NUXT_API_ORIGIN') || ''
  const origin = raw.replace(/\/$/, '')
  if (!origin) {
    return Response.json(
      {
        code: 'API_UNAVAILABLE',
        message:
          'L’API publique n’est pas configurée. Définis API_ORIGIN dans Netlify, puis relance le déploiement.',
      },
      { status: 503 },
    )
  }

  const incoming = new URL(request.url)
  const target = new URL(`${incoming.pathname}${incoming.search}`, origin)
  const headers = new Headers(request.headers)
  headers.delete('host')
  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    redirect: 'manual',
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
    init.duplex = 'half'
  }
  return fetch(target, init)
}

export const config = { path: ['/api/*', '/uploads/*'] }

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (!path.startsWith('/api') && !path.startsWith('/uploads')) return

  const host = getRequestURL(event).hostname
  if (LOCAL_HOSTS.has(host)) return

  const config = useRuntimeConfig()
  const origin = String(config.apiOrigin || '').replace(/\/$/, '')
  if (!origin) {
    throw createError({
      statusCode: 503,
      statusMessage: 'API non configurée',
      data: {
        code: 'API_UNAVAILABLE',
        message:
          'L’API publique n’est pas configurée. Définis API_ORIGIN dans Netlify, puis relance le déploiement.',
      },
    })
  }

  return proxyRequest(event, `${origin}${path}`)
})

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

export function resolveApiBase(configured: string, pageHost: string) {
  const value = configured.replace(/\/$/, '')
  const pageIsLocal = LOCAL_HOSTS.has(pageHost)
  const apiIsLocal =
    !value ||
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(value)

  if (pageIsLocal) return value || 'http://localhost:3001/api'
  if (!apiIsLocal) return value
  return '/api'
}

export function useApiBase() {
  const config = useRuntimeConfig()
  const configured = String(config.public.apiBase || '')
  const pageHost = import.meta.client
    ? window.location.hostname
    : useRequestURL().hostname
  return resolveApiBase(configured, pageHost)
}

export function mediaOrigin(apiBase: string, pageOrigin: string) {
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    return apiBase.replace(/\/api\/?$/, '')
  }
  return pageOrigin.replace(/\/$/, '')
}

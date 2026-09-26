export function useMediaUrl() {
  const config = useRuntimeConfig()

  function mediaUrl(path?: string | null) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path
    }
    const apiBase = String(config.public.apiBase || 'http://localhost:3001/api')
    const origin = apiBase.replace(/\/api\/?$/, '')
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`
  }

  return { mediaUrl }
}

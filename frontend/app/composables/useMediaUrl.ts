export function useMediaUrl() {
  const apiBase = useApiBase()
  const pageOrigin = import.meta.client ? window.location.origin : useRequestURL().origin

  function mediaUrl(path?: string | null) {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path
    }
    const origin = mediaOrigin(apiBase, pageOrigin)
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`
  }

  return { mediaUrl }
}

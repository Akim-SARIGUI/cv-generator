export function apiErrorMessage(
  error: unknown,
  fallback: string,
  networkFallback = 'Impossible de joindre le serveur. Réessayez dans un instant.',
  translateCode?: (code: string) => string | null,
) {
  const payload = error as {
    data?: { message?: string | string[]; code?: string; codes?: string[] }
    message?: string
  }
  const data = payload?.data
  const codes = [
    ...(data?.code && data.code !== 'VALIDATION' ? [data.code] : []),
    ...(Array.isArray(data?.codes) ? data.codes : []),
  ]

  if (codes.length && translateCode) {
    const raw = data?.message
    const lines = codes.map((code, index) => {
      const translated = translateCode(code)
      if (translated) return translated
      if (Array.isArray(raw) && typeof raw[index] === 'string' && raw[index].trim()) {
        return raw[index]
      }
      return fallback
    })
    const unique = [...new Set(lines.filter(Boolean))]
    if (unique.length) return unique.join(' ')
  }

  const message = data?.message
  if (Array.isArray(message) && message.length) return message.join(' ')
  if (typeof message === 'string' && message.trim()) return message

  const rawMessage = typeof payload?.message === 'string' ? payload.message : ''
  if (/failed to fetch|networkerror|load failed|origine cors/i.test(rawMessage)) {
    return networkFallback
  }
  return fallback
}

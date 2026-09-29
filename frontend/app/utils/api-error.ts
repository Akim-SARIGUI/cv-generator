export function apiErrorMessage(
  error: unknown,
  fallback: string,
  networkFallback = 'Impossible de joindre le serveur.',
) {
  const payload = error as {
    data?: { message?: string | string[] }
    message?: string
  }
  const message = payload?.data?.message
  if (Array.isArray(message) && message.length) return message.join(', ')
  if (typeof message === 'string' && message.trim()) return message

  const raw = typeof payload?.message === 'string' ? payload.message : ''
  if (/failed to fetch|networkerror|load failed|origine cors/i.test(raw)) {
    return networkFallback
  }
  return fallback
}

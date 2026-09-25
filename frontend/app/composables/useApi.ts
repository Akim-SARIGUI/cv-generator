export function useApi() {
  const config = useRuntimeConfig()
  const { token, logout } = useAuth()

  async function api<T>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      body?: unknown
      responseType?: 'json' | 'blob'
    } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {}
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, {
        method: options.method || 'GET',
        body: options.body as BodyInit | Record<string, unknown> | null | undefined,
        headers,
        responseType: options.responseType === 'blob' ? 'blob' : undefined,
      })
    } catch (error: unknown) {
      const status = (error as { statusCode?: number })?.statusCode
      if (status === 401) {
        logout()
      }
      throw error
    }
  }

  return { api }
}

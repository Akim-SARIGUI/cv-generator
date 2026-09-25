import type { AuthResponse, AuthUser } from '~/types/cv'

export function useAuth() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('cv_token', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })
  const user = useState<AuthUser | null>('auth-user', () => null)

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(email: string, password: string) {
    const data = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })
    token.value = data.accessToken
    user.value = data.user
    return data
  }

  async function register(payload: {
    email: string
    username: string
    password: string
  }) {
    const data = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/register`, {
      method: 'POST',
      body: payload,
    })
    token.value = data.accessToken
    user.value = data.user
    return data
  }

  async function fetchMe() {
    if (!token.value) {
      user.value = null
      return null
    }
    try {
      user.value = await $fetch<AuthUser>(`${config.public.apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      return user.value
    } catch {
      token.value = null
      user.value = null
      return null
    }
  }

  function logout() {
    token.value = null
    user.value = null
    navigateTo('/auth/login')
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    fetchMe,
    logout,
  }
}

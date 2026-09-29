export default defineNuxtRouteMiddleware(async (to) => {
  const { token, user, fetchMe } = useAuth()

  if (token.value && !user.value) {
    await fetchMe()
  }

  const isAuthPage = to.path.startsWith('/auth')
  const isPublic = to.path === '/' || isAuthPage

  if (!token.value && !isPublic) {
    return navigateTo('/auth/login')
  }

  if (token.value && isAuthPage) {
    return navigateTo('/dashboard')
  }

  if (to.path.startsWith('/admin') && user.value?.role !== 'ADMIN') {
    return navigateTo('/dashboard')
  }
})

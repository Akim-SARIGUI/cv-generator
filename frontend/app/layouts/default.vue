<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!mobile"
      width="260"
      class="app-side"
    >
      <div class="side-shell">
      <div class="side-brand">
        <NuxtLink to="/" class="font-display text-xl font-semibold text-ink no-underline" @click="closeOnMobile">
          CV Studio
        </NuxtLink>
      </div>

      <v-list nav density="comfortable" class="px-2">
        <v-list-item
          v-for="item in links"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :active="isActive(item.to)"
          rounded="lg"
          color="primary"
          @click="closeOnMobile"
        >
          {{ item.label }}
        </v-list-item>
      </v-list>

      <div class="side-foot">
        <CvLocaleSwitch compact class="mb-3" />
        <p v-if="isAuthenticated" class="text-sm text-muted mb-3">{{ user?.username }}</p>
        <v-btn
          v-if="isAuthenticated"
          block
          color="primary"
          variant="tonal"
          @click="onLogout"
        >
          {{ t('navLogout') }}
        </v-btn>
      </div>
      </div>
    </v-navigation-drawer>

    <div v-if="mobile" class="mobile-bar">
      <v-btn icon="mdi-menu" variant="text" :aria-label="t('navMenu')" @click="drawer = true" />
      <span class="font-display text-lg text-ink">CV Studio</span>
    </div>

    <v-main>
      <slot />
    </v-main>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const { t } = useUiI18n()
const route = useRoute()
const { mobile } = useDisplay()
const drawer = ref(true)

const links = computed(() => {
  if (!isAuthenticated.value) {
    return [
      { to: '/auth/login', label: t('navLogin'), icon: 'mdi-login' },
      { to: '/auth/register', label: t('navRegister'), icon: 'mdi-account-plus' },
    ]
  }
  const items = [
    { to: '/dashboard', label: t('navDashboard'), icon: 'mdi-view-dashboard-outline' },
    { to: '/editor', label: t('navEditor'), icon: 'mdi-file-document-edit-outline' },
    { to: '/preview', label: t('navPreview'), icon: 'mdi-eye-outline' },
  ]
  if (user.value?.role === 'ADMIN') {
    items.push({ to: '/admin', label: t('navAdmin'), icon: 'mdi-shield-account-outline' })
  }
  return items
})

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function closeOnMobile() {
  if (mobile.value) drawer.value = false
}

async function onLogout() {
  await logout()
  if (mobile.value) drawer.value = false
}

watch(mobile, (isMobile) => {
  drawer.value = !isMobile
}, { immediate: true })
</script>

<style scoped>
.app-side {
  background: #fff;
  border-right: 1px solid var(--cv-line);
}
.side-shell {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.side-brand {
  padding: 1.25rem 1.25rem 0.5rem;
}
.side-foot {
  margin-top: auto;
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid var(--cv-line);
}
.mobile-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid var(--cv-line);
  position: sticky;
  top: 0;
  z-index: 5;
}
</style>

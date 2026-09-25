<template>
  <div>
    <v-app-bar flat border class="!bg-white/90 backdrop-blur">
      <v-container class="d-flex align-center py-0" fluid>
        <NuxtLink to="/" class="font-display text-xl font-semibold text-ink no-underline">
          CV Studio
        </NuxtLink>
        <v-spacer />
        <template v-if="isAuthenticated">
          <v-btn variant="text" to="/editor" class="me-1">Éditeur</v-btn>
          <v-btn variant="text" to="/preview" class="me-2">Aperçu</v-btn>
          <span class="text-sm text-muted me-3 hidden sm:inline">{{ user?.username }}</span>
          <v-btn color="primary" variant="tonal" @click="logout">Déconnexion</v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" to="/auth/login" class="me-2">Connexion</v-btn>
          <v-btn color="primary" to="/auth/register">Créer un compte</v-btn>
        </template>
      </v-container>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
</script>

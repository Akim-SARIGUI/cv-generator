<template>
  <div>
    <NuxtLayout name="auth">
      <v-card class="w-full max-w-md p-2" border>
        <v-card-title class="font-display text-2xl pt-6 px-6">Créer un compte</v-card-title>
        <v-card-subtitle class="px-6">Votre premier CV est créé automatiquement</v-card-subtitle>
        <v-card-text class="px-6 pb-6">
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
          <v-form @submit.prevent="onSubmit">
            <v-text-field v-model="username" label="Nom d’utilisateur" autocomplete="username" class="mb-2" />
            <v-text-field v-model="email" label="Email" type="email" autocomplete="email" class="mb-2" />
            <v-text-field
              v-model="password"
              label="Mot de passe (8+ caractères)"
              type="password"
              autocomplete="new-password"
              class="mb-4"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Créer mon compte
            </v-btn>
          </v-form>
          <p class="text-sm text-muted mt-4 text-center">
            Déjà inscrit ?
            <NuxtLink to="/auth/login" class="text-accent font-semibold">Se connecter</NuxtLink>
          </p>
        </v-card-text>
      </v-card>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { apiErrorMessage } from '~/utils/api-error'

definePageMeta({ layout: false })

const { register } = useAuth()
const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await register({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Inscription impossible', 'Impossible de joindre le serveur. Réessayez dans un instant.')
  } finally {
    loading.value = false
  }
}
</script>

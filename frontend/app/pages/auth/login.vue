<template>
  <div>
    <NuxtLayout name="auth">
      <v-card class="w-full max-w-md p-2" border>
        <v-card-title class="font-display text-2xl pt-6 px-6">Connexion</v-card-title>
        <v-card-subtitle class="px-6">Accédez à votre espace CV</v-card-subtitle>
        <v-card-text class="px-6 pb-6">
          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
          <v-form @submit.prevent="onSubmit">
            <v-text-field v-model="email" label="Email" type="email" autocomplete="email" class="mb-2" />
            <v-text-field
              v-model="password"
              label="Mot de passe"
              type="password"
              autocomplete="current-password"
              class="mb-4"
            />
            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Se connecter
            </v-btn>
          </v-form>
          <p class="text-sm text-muted mt-4 text-center">
            Pas de compte ?
            <NuxtLink to="/auth/register" class="text-accent font-semibold">Créer un compte</NuxtLink>
          </p>
        </v-card-text>
      </v-card>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { login } = useAuth()
const { te } = useUiI18n()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e: unknown) {
    error.value = te(e, 'errLogin')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="mb-8">
      <h1 class="font-display text-3xl md:text-4xl text-ink">{{ t('adminTitle') }}</h1>
      <p class="text-muted mt-1">{{ t('adminSubtitle') }}</p>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-6" />

    <section v-if="overview" class="grid gap-4 md:grid-cols-3 mb-8">
      <article class="rounded-2xl border border-[var(--cv-line)] bg-white p-5">
        <p class="text-sm text-muted">{{ t('adminUsers') }}</p>
        <p class="font-display text-3xl text-ink mt-1">{{ overview.users }}</p>
      </article>
      <article class="rounded-2xl border border-[var(--cv-line)] bg-white p-5">
        <p class="text-sm text-muted">{{ t('adminResumes') }}</p>
        <p class="font-display text-3xl text-ink mt-1">{{ overview.resumes }}</p>
      </article>
      <article class="rounded-2xl border border-[var(--cv-line)] bg-white p-5">
        <p class="text-sm text-muted">{{ t('adminAdmins') }}</p>
        <p class="font-display text-3xl text-ink mt-1">{{ overview.admins }}</p>
      </article>
    </section>

    <section class="rounded-2xl border border-[var(--cv-line)] bg-white overflow-hidden">
      <div class="px-5 py-4 border-b border-[var(--cv-line)]">
        <h2 class="font-display text-xl">{{ t('adminUsers') }}</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-muted">
            <tr>
              <th class="px-5 py-3 font-medium">{{ t('adminUsername') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('adminEmail') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('adminRole') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('adminCvCount') }}</th>
              <th class="px-5 py-3 font-medium">{{ t('adminCreated') }}</th>
              <th class="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr v-if="!users.length">
              <td class="px-5 py-6 text-muted" colspan="6">{{ t('adminEmpty') }}</td>
            </tr>
            <tr v-for="account in users" :key="account.id" class="border-t border-[var(--cv-line)]">
              <td class="px-5 py-3">
                {{ account.username }}
                <v-chip v-if="account.id === user?.id" size="x-small" class="ms-2" variant="tonal">
                  {{ t('adminYou') }}
                </v-chip>
              </td>
              <td class="px-5 py-3">{{ account.email }}</td>
              <td class="px-5 py-3">
                {{ account.role === 'ADMIN' ? t('dashRoleAdmin') : t('dashRoleUser') }}
              </td>
              <td class="px-5 py-3">{{ account._count.resumes }}</td>
              <td class="px-5 py-3">{{ formatDate(account.createdAt) }}</td>
              <td class="px-5 py-3 text-end whitespace-nowrap">
                <v-btn
                  v-if="account.role !== 'ADMIN'"
                  size="small"
                  variant="text"
                  color="primary"
                  :loading="busyId === account.id"
                  @click="setRole(account.id, 'ADMIN')"
                >
                  {{ t('adminPromote') }}
                </v-btn>
                <v-btn
                  v-else-if="account.id !== user?.id"
                  size="small"
                  variant="text"
                  :loading="busyId === account.id"
                  @click="setRole(account.id, 'USER')"
                >
                  {{ t('adminDemote') }}
                </v-btn>
                <v-btn
                  v-if="account.id !== user?.id"
                  size="small"
                  variant="text"
                  color="error"
                  @click="askDelete(account)"
                >
                  {{ t('adminDelete') }}
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <v-dialog v-model="deleteOpen" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="font-display text-xl">{{ t('adminDelete') }}</v-card-title>
        <v-card-text>{{ t('adminDeleteConfirm') }}</v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteOpen = false">{{ t('cancel') }}</v-btn>
          <v-btn color="error" :loading="Boolean(busyId)" @click="confirmDelete">
            {{ t('adminDelete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { UserRole } from '~/types/cv'
import { apiErrorMessage } from '~/utils/api-error'

type AdminUser = {
  id: string
  email: string
  username: string
  role: UserRole
  createdAt: string
  _count: { resumes: number }
}

type Overview = {
  users: number
  resumes: number
  admins: number
}

const { t, locale } = useUiI18n()
const { user } = useAuth()
const { api } = useApi()

const overview = ref<Overview | null>(null)
const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref('')
const busyId = ref('')
const deleteOpen = ref(false)
const pending = ref<AdminUser | null>(null)

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [stats, accounts] = await Promise.all([
      api<Overview>('/admin/overview'),
      api<AdminUser[]>('/admin/users'),
    ])
    overview.value = stats
    users.value = accounts
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de charger l’administration')
  } finally {
    loading.value = false
  }
}

async function setRole(id: string, role: UserRole) {
  busyId.value = id
  error.value = ''
  try {
    await api(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } })
    await load()
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de modifier le rôle')
  } finally {
    busyId.value = ''
  }
}

function askDelete(account: AdminUser) {
  pending.value = account
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pending.value) return
  busyId.value = pending.value.id
  error.value = ''
  try {
    await api(`/admin/users/${pending.value.id}`, { method: 'DELETE' })
    deleteOpen.value = false
    pending.value = null
    await load()
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de supprimer ce compte')
  } finally {
    busyId.value = ''
  }
}

onMounted(load)
</script>

<template>
  <div class="page-shell">
    <div class="d-flex flex-wrap align-center justify-space-between gap-4 mb-8">
      <div>
        <h1 class="font-display text-3xl md:text-4xl text-ink">
          {{ t('dashHello', { name: user?.username || '…' }) }}
        </h1>
        <p class="text-muted mt-1">{{ t('dashSubtitle') }}</p>
      </div>
      <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="openCreate">
        {{ t('dashNew') }}
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-6" />

    <section class="grid gap-4 md:grid-cols-3 mb-8">
      <article class="rounded-2xl border border-[var(--cv-line)] bg-white p-5">
        <p class="text-sm text-muted">{{ t('dashResumes') }}</p>
        <p class="font-display text-3xl text-ink mt-1">{{ resumes.length }}</p>
      </article>
      <article class="rounded-2xl border border-[var(--cv-line)] bg-white p-5">
        <p class="text-sm text-muted">{{ t('dashLastUpdate') }}</p>
        <p class="font-display text-xl text-ink mt-2">{{ lastUpdateLabel }}</p>
      </article>
      <article class="rounded-2xl border border-[var(--cv-line)] bg-white p-5">
        <p class="text-sm text-muted">{{ t('dashRole') }}</p>
        <p class="font-display text-xl text-ink mt-2">
          {{ user?.role === 'ADMIN' ? t('dashRoleAdmin') : t('dashRoleUser') }}
        </p>
      </article>
    </section>

    <p v-if="!loading && !resumes.length" class="text-muted">{{ t('dashEmpty') }}</p>

    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="item in resumes"
        :key="item.id"
        class="rounded-2xl border border-[var(--cv-line)] bg-white p-5"
      >
        <div class="d-flex align-start justify-space-between gap-3">
          <div>
            <div class="d-flex align-center gap-2 flex-wrap">
              <h2 class="font-display text-2xl text-ink">{{ item.title }}</h2>
              <v-chip v-if="item.isDefault" size="small" color="primary" variant="tonal">
                {{ t('dashDefault') }}
              </v-chip>
            </div>
            <p class="text-muted text-sm mt-1">
              {{ item.personal?.fullName || user?.username }}
              · {{ t('dashUpdated', { date: formatDate(item.updatedAt) }) }}
            </p>
          </div>
          <div class="text-end">
            <p class="text-xs uppercase tracking-wide text-muted">{{ t('dashCompletion') }}</p>
            <p class="font-display text-2xl text-primary">{{ completion(item) }}%</p>
          </div>
        </div>

        <v-progress-linear
          :model-value="completion(item)"
          color="primary"
          height="6"
          rounded
          class="my-4"
        />

        <p class="text-sm text-muted mb-4">
          {{ t('dashExperiences', { n: item._count?.experiences ?? 0 }) }}
          · {{ t('dashEducations', { n: item._count?.educations ?? 0 }) }}
          · {{ t('dashSkills', { n: item._count?.skills ?? 0 }) }}
        </p>

        <div class="d-flex flex-wrap gap-2">
          <v-btn color="primary" :to="`/editor?id=${item.id}`">{{ t('dashEdit') }}</v-btn>
          <v-btn variant="outlined" color="primary" :to="`/preview?id=${item.id}`">
            {{ t('dashPreview') }}
          </v-btn>
          <v-btn
            v-if="!item.isDefault"
            variant="text"
            :loading="busyId === item.id"
            @click="makeDefault(item.id)"
          >
            {{ t('dashMakeDefault') }}
          </v-btn>
          <v-btn
            v-if="resumes.length > 1"
            variant="text"
            color="error"
            @click="askDelete(item)"
          >
            {{ t('dashDelete') }}
          </v-btn>
        </div>
      </article>
    </section>

    <v-dialog v-model="createOpen" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="font-display text-xl">{{ t('dashCreateTitle') }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="newTitle" :label="t('dashCreateLabel')" autofocus @keyup.enter="createResume" />
        </v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="createOpen = false">{{ t('cancel') }}</v-btn>
          <v-btn color="primary" :loading="creating" :disabled="!newTitle.trim()" @click="createResume">
            {{ t('dashNew') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="font-display text-xl">{{ t('dashDelete') }}</v-card-title>
        <v-card-text>{{ t('dashDeleteConfirm') }}</v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteOpen = false">{{ t('cancel') }}</v-btn>
          <v-btn color="error" :loading="creating" @click="confirmDelete">{{ t('dashDelete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Resume } from '~/types/cv'
import { apiErrorMessage } from '~/utils/api-error'

const { t, locale } = useUiI18n()
const { user } = useAuth()
const { api } = useApi()

const resumes = ref<Resume[]>([])
const loading = ref(true)
const error = ref('')
const createOpen = ref(false)
const deleteOpen = ref(false)
const newTitle = ref('')
const creating = ref(false)
const busyId = ref('')
const pendingDelete = ref<Resume | null>(null)

const lastUpdateLabel = computed(() => {
  const latest = resumes.value
    .map((item) => item.updatedAt)
    .sort()
    .at(-1)
  return latest ? formatDate(latest) : t('dashNone')
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function completion(item: Resume) {
  let score = 0
  if (item.personal?.fullName?.trim()) score += 20
  if (item.personal?.email?.trim()) score += 10
  if (item.personal?.summary?.trim() || item.personal?.objective?.trim()) score += 20
  if ((item._count?.experiences ?? 0) > 0) score += 20
  if ((item._count?.educations ?? 0) > 0) score += 15
  if ((item._count?.skills ?? 0) > 0) score += 15
  return score
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    resumes.value = await api<Resume[]>('/resumes')
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de charger le tableau de bord')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  newTitle.value = 'Mon CV'
  createOpen.value = true
}

async function createResume() {
  const title = newTitle.value.trim()
  if (!title) return
  creating.value = true
  error.value = ''
  try {
    const created = await api<Resume>('/resumes', { method: 'POST', body: { title } })
    createOpen.value = false
    await navigateTo(`/editor?id=${created.id}`)
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de créer le CV')
  } finally {
    creating.value = false
  }
}

async function makeDefault(id: string) {
  busyId.value = id
  error.value = ''
  try {
    await api(`/resumes/${id}`, { method: 'PATCH', body: { isDefault: true } })
    await load()
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de mettre ce CV par défaut')
  } finally {
    busyId.value = ''
  }
}

function askDelete(item: Resume) {
  pendingDelete.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  creating.value = true
  error.value = ''
  try {
    await api(`/resumes/${pendingDelete.value.id}`, { method: 'DELETE' })
    deleteOpen.value = false
    pendingDelete.value = null
    await load()
  } catch (e: unknown) {
    error.value = apiErrorMessage(e, 'Impossible de supprimer ce CV')
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>

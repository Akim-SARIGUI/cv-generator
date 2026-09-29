<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="font-display text-xl">{{ t('tabExperience') }}</h2>
        <p class="text-sm text-muted">{{ t('hintExperience') }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">{{ t('btnAdd') }}</v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-3" density="compact">
      {{ errorMsg }}
    </v-alert>

    <div v-if="!(resume?.experiences?.length)" class="text-muted text-sm mb-2">
      {{ t('emptyExperience') }}
    </div>

    <v-list lines="three" class="bg-transparent">
      <v-list-item
        v-for="item in resume?.experiences || []"
        :key="item.id"
        class="border rounded-lg mb-2 px-3"
      >
        <template #title>
          <span class="font-medium">{{ item.jobTitle }}</span>
        </template>
        <template #subtitle>
          <div>{{ item.company }}<span v-if="item.location"> · {{ item.location }}</span></div>
          <div class="text-xs mt-1">{{ item.description || t('infoNoDescription') }}</div>
        </template>
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            :loading="busyId === item.id"
            @click="removeItem(item.id)"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="680" persistent>
      <v-card class="pa-4">
        <v-card-title class="font-display">
          {{ editingId ? t('dialogExpEdit') : t('dialogExpNew') }}
        </v-card-title>
        <v-card-text>
          <CvExperienceFields v-model="form" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">{{ t('cancel') }}</v-btn>
          <v-btn color="primary" :loading="busy" @click="save">{{ t('btnSave') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import type { Experience } from '~/types/cv'
import { toApiDate, toInputDate } from '~/utils/dates'

const { t, te } = useUiI18n()
const { resume, addExperience, updateExperience, removeExperience } = useResume()

const dialog = ref(false)
const busy = ref(false)
const busyId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const errorMsg = ref('')
const form = ref(emptyForm())

function emptyForm(): Partial<Experience> {
  return {
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    currentJob: false,
    description: '',
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  errorMsg.value = ''
  dialog.value = true
}

function openEdit(item: Experience) {
  editingId.value = item.id
  form.value = {
    jobTitle: item.jobTitle,
    company: item.company,
    location: item.location || '',
    startDate: toInputDate(item.startDate),
    endDate: toInputDate(item.endDate),
    currentJob: item.currentJob,
    description: item.description || '',
  }
  errorMsg.value = ''
  dialog.value = true
}

function payload() {
  return {
    jobTitle: (form.value.jobTitle || '').trim(),
    company: (form.value.company || '').trim(),
    location: form.value.location || undefined,
    startDate: toApiDate(form.value.startDate),
    endDate: form.value.currentJob ? undefined : toApiDate(form.value.endDate),
    currentJob: Boolean(form.value.currentJob),
    description: form.value.description || undefined,
  }
}

async function save() {
  errorMsg.value = ''
  const body = payload()
  if (!body.jobTitle || !body.company) {
    errorMsg.value = t('infoJobRequired')
    return
  }
  busy.value = true
  try {
    if (editingId.value) {
      await updateExperience(editingId.value, body)
    } else {
      await addExperience(body)
    }
    dialog.value = false
  } catch (e: unknown) {
    errorMsg.value = te(e, 'infoSaveFailed')
  } finally {
    busy.value = false
  }
}

async function removeItem(id: string) {
  busyId.value = id
  try {
    await removeExperience(id)
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="font-display text-xl">Formations</h2>
        <p class="text-sm text-muted">Diplômes et parcours scolaire / universitaire</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Ajouter</v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-3" density="compact">
      {{ errorMsg }}
    </v-alert>

    <div v-if="!(resume?.educations?.length)" class="text-muted text-sm mb-2">
      Aucune formation pour le moment.
    </div>

    <v-list lines="three" class="bg-transparent">
      <v-list-item
        v-for="item in resume?.educations || []"
        :key="item.id"
        class="border rounded-lg mb-2 px-3"
      >
        <template #title>
          <span class="font-medium">{{ item.degree }}</span>
        </template>
        <template #subtitle>
          <div>{{ item.institution }}</div>
          <div class="text-xs mt-1">{{ item.description || 'Sans description' }}</div>
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
          {{ editingId ? 'Modifier la formation' : 'Nouvelle formation' }}
        </v-card-title>
        <v-card-text>
          <CvEducationFields v-model="form" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="busy" @click="save">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import type { Education } from '~/types/cv'
import { toApiDate, toInputDate } from '~/utils/dates'

const { resume, addEducation, updateEducation, removeEducation } = useResume()

const dialog = ref(false)
const busy = ref(false)
const busyId = ref<string | null>(null)
const editingId = ref<string | null>(null)
const errorMsg = ref('')
const form = ref(emptyForm())

function emptyForm(): Partial<Education> {
  return {
    degree: '',
    institution: '',
    location: '',
    startDate: '',
    endDate: '',
    currentEducation: false,
    description: '',
  }
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  errorMsg.value = ''
  dialog.value = true
}

function openEdit(item: Education) {
  editingId.value = item.id
  form.value = {
    degree: item.degree,
    institution: item.institution,
    location: item.location || '',
    startDate: toInputDate(item.startDate),
    endDate: toInputDate(item.endDate),
    currentEducation: item.currentEducation,
    description: item.description || '',
  }
  errorMsg.value = ''
  dialog.value = true
}

function payload() {
  return {
    degree: (form.value.degree || '').trim(),
    institution: (form.value.institution || '').trim(),
    location: form.value.location || undefined,
    startDate: toApiDate(form.value.startDate),
    endDate: form.value.currentEducation
      ? undefined
      : toApiDate(form.value.endDate),
    currentEducation: Boolean(form.value.currentEducation),
    description: form.value.description || undefined,
  }
}

async function save() {
  errorMsg.value = ''
  const body = payload()
  if (!body.degree || !body.institution) {
    errorMsg.value = 'Diplôme et établissement sont obligatoires'
    return
  }
  busy.value = true
  try {
    if (editingId.value) {
      await updateEducation(editingId.value, body)
    } else {
      await addEducation(body)
    }
    dialog.value = false
  } catch (e: unknown) {
    const msg =
      (e as { data?: { message?: string | string[] } })?.data?.message ||
      'Échec de l’enregistrement'
    errorMsg.value = Array.isArray(msg) ? msg.join(', ') : String(msg)
  } finally {
    busy.value = false
  }
}

async function removeItem(id: string) {
  busyId.value = id
  try {
    await removeEducation(id)
  } finally {
    busyId.value = null
  }
}
</script>

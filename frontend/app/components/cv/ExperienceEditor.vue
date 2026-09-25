<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="font-display text-xl">Expériences</h2>
      <v-btn color="secondary" variant="tonal" prepend-icon="mdi-plus" @click="openCreate">
        Ajouter
      </v-btn>
    </div>

    <div v-if="!(resume?.experiences?.length)" class="text-muted text-sm mb-2">
      Aucune expérience pour le moment.
    </div>

    <v-expansion-panels variant="accordion" class="mb-2">
      <v-expansion-panel v-for="item in resume?.experiences || []" :key="item.id">
        <v-expansion-panel-title>
          <div>
            <div class="font-medium">{{ item.jobTitle || 'Poste' }}</div>
            <div class="text-sm text-muted">{{ item.company }}</div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <ExperienceFields v-model="drafts[item.id]" />
          <div class="d-flex gap-2 mt-3">
            <v-btn color="primary" :loading="busyId === item.id" @click="saveItem(item.id)">
              Enregistrer
            </v-btn>
            <v-btn color="error" variant="text" @click="removeItem(item.id)">Supprimer</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog v-model="dialog" max-width="640">
      <v-card class="pa-4">
        <v-card-title class="font-display">Nouvelle expérience</v-card-title>
        <v-card-text>
          <ExperienceFields v-model="createForm" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="creating" @click="createItem">Ajouter</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import type { Experience } from '~/types/cv'

const { resume, addExperience, updateExperience, removeExperience } = useResume()

const dialog = ref(false)
const creating = ref(false)
const busyId = ref<string | null>(null)
const drafts = reactive<Record<string, Partial<Experience>>>({})

const emptyForm = (): Partial<Experience> => ({
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  currentJob: false,
  description: '',
})

const createForm = ref(emptyForm())

watch(
  () => resume.value?.experiences,
  (items) => {
    for (const item of items || []) {
      drafts[item.id] = {
        jobTitle: item.jobTitle,
        company: item.company,
        location: item.location || '',
        startDate: item.startDate ? item.startDate.slice(0, 10) : '',
        endDate: item.endDate ? item.endDate.slice(0, 10) : '',
        currentJob: item.currentJob,
        description: item.description || '',
      }
    }
  },
  { immediate: true, deep: true },
)

function openCreate() {
  createForm.value = emptyForm()
  dialog.value = true
}

async function createItem() {
  creating.value = true
  try {
    await addExperience(normalize(createForm.value))
    dialog.value = false
  } finally {
    creating.value = false
  }
}

async function saveItem(id: string) {
  busyId.value = id
  try {
    await updateExperience(id, normalize(drafts[id]))
  } finally {
    busyId.value = null
  }
}

async function removeItem(id: string) {
  await removeExperience(id)
}

function normalize(form: Partial<Experience>) {
  return {
    jobTitle: form.jobTitle || '',
    company: form.company || '',
    location: form.location || undefined,
    startDate: form.startDate || undefined,
    endDate: form.currentJob ? undefined : form.endDate || undefined,
    currentJob: Boolean(form.currentJob),
    description: form.description || undefined,
  }
}
</script>

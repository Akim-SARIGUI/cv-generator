<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="font-display text-xl">Formations</h2>
      <v-btn color="secondary" variant="tonal" prepend-icon="mdi-plus" @click="openCreate">
        Ajouter
      </v-btn>
    </div>

    <div v-if="!(resume?.educations?.length)" class="text-muted text-sm mb-2">
      Aucune formation pour le moment.
    </div>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel v-for="item in resume?.educations || []" :key="item.id">
        <v-expansion-panel-title>
          <div>
            <div class="font-medium">{{ item.degree || 'Diplôme' }}</div>
            <div class="text-sm text-muted">{{ item.institution }}</div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <EducationFields v-model="drafts[item.id]" />
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
        <v-card-title class="font-display">Nouvelle formation</v-card-title>
        <v-card-text>
          <EducationFields v-model="createForm" />
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
import type { Education } from '~/types/cv'

const { resume, addEducation, updateEducation, removeEducation } = useResume()
const dialog = ref(false)
const creating = ref(false)
const busyId = ref<string | null>(null)
const drafts = reactive<Record<string, Partial<Education>>>({})

const emptyForm = (): Partial<Education> => ({
  degree: '',
  institution: '',
  location: '',
  startDate: '',
  endDate: '',
  currentEducation: false,
  description: '',
})

const createForm = ref(emptyForm())

watch(
  () => resume.value?.educations,
  (items) => {
    for (const item of items || []) {
      drafts[item.id] = {
        degree: item.degree,
        institution: item.institution,
        location: item.location || '',
        startDate: item.startDate ? item.startDate.slice(0, 10) : '',
        endDate: item.endDate ? item.endDate.slice(0, 10) : '',
        currentEducation: item.currentEducation,
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
    await addEducation(normalize(createForm.value))
    dialog.value = false
  } finally {
    creating.value = false
  }
}

async function saveItem(id: string) {
  busyId.value = id
  try {
    await updateEducation(id, normalize(drafts[id]))
  } finally {
    busyId.value = null
  }
}

async function removeItem(id: string) {
  await removeEducation(id)
}

function normalize(form: Partial<Education>) {
  return {
    degree: form.degree || '',
    institution: form.institution || '',
    location: form.location || undefined,
    startDate: form.startDate || undefined,
    endDate: form.currentEducation ? undefined : form.endDate || undefined,
    currentEducation: Boolean(form.currentEducation),
    description: form.description || undefined,
  }
}
</script>

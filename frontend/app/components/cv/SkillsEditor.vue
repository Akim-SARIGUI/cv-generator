<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="font-display text-xl">Compétences</h2>
      <v-btn color="secondary" variant="tonal" prepend-icon="mdi-plus" @click="openCreate">
        Ajouter
      </v-btn>
    </div>

    <div v-if="!(resume?.skills?.length)" class="text-muted text-sm mb-2">
      Aucune compétence pour le moment.
    </div>

    <v-list lines="two" class="bg-transparent">
      <v-list-item
        v-for="item in resume?.skills || []"
        :key="item.id"
        class="border rounded-lg mb-2"
      >
        <template #title>
          <span class="font-medium">{{ item.name }}</span>
        </template>
        <template #subtitle>
          {{ categoryLabel(item.category) }} · Niveau {{ item.proficiency }}/5
        </template>
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="removeItem(item.id)" />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="520">
      <v-card class="pa-4">
        <v-card-title class="font-display">
          {{ editingId ? 'Modifier' : 'Ajouter' }} une compétence
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.name" label="Nom *" class="mb-2" />
          <v-select
            v-model="form.category"
            :items="categories"
            item-title="title"
            item-value="value"
            label="Catégorie"
            class="mb-2"
          />
          <v-slider
            v-model="form.proficiency"
            :min="1"
            :max="5"
            :step="1"
            thumb-label
            label="Niveau"
          />
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
import type { Skill, SkillCategory } from '~/types/cv'

const { resume, addSkill, updateSkill, removeSkill } = useResume()

const dialog = ref(false)
const busy = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({
  name: '',
  category: 'TECHNICAL' as SkillCategory,
  proficiency: 3,
})

const categories = [
  { title: 'Technique', value: 'TECHNICAL' },
  { title: 'Soft skill', value: 'SOFT' },
  { title: 'Langue', value: 'LANGUAGE' },
  { title: 'Outil', value: 'TOOL' },
  { title: 'Autre', value: 'OTHER' },
]

function categoryLabel(category: SkillCategory) {
  return categories.find((c) => c.value === category)?.title || category
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.category = 'TECHNICAL'
  form.proficiency = 3
  dialog.value = true
}

function openEdit(item: Skill) {
  editingId.value = item.id
  form.name = item.name
  form.category = item.category
  form.proficiency = item.proficiency
  dialog.value = true
}

async function save() {
  busy.value = true
  try {
    const payload = {
      name: form.name,
      category: form.category,
      proficiency: form.proficiency,
    }
    if (editingId.value) {
      await updateSkill(editingId.value, payload)
    } else {
      await addSkill(payload)
    }
    dialog.value = false
  } finally {
    busy.value = false
  }
}

async function removeItem(id: string) {
  await removeSkill(id)
}
</script>

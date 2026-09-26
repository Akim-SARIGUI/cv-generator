<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="font-display text-xl">{{ title }}</h2>
        <p class="text-sm text-muted">{{ hint }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Ajouter</v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-3" density="compact">
      {{ errorMsg }}
    </v-alert>

    <div v-if="!items.length" class="text-muted text-sm mb-2">Aucun élément pour le moment.</div>

    <v-list lines="two" class="bg-transparent">
      <v-list-item
        v-for="item in items"
        :key="item.id"
        class="border rounded-lg mb-2 px-3"
      >
        <template #title>
          <span class="font-medium">{{ item.title }}</span>
        </template>
        <template #subtitle>
          {{ [item.subtitle, item.dateLabel].filter(Boolean).join(' · ') || item.description }}
        </template>
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="removeItem(item.id)"
          />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="640" persistent>
      <v-card class="pa-4">
        <v-card-title class="font-display">
          {{ editingId ? 'Modifier' : 'Ajouter' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" :label="titleLabel" class="mb-2" />
          <v-text-field
            v-if="kind !== 'INTEREST'"
            v-model="form.subtitle"
            :label="subtitleLabel"
            class="mb-2"
          />
          <v-text-field
            v-if="kind !== 'INTEREST'"
            v-model="form.dateLabel"
            label="Date / année"
            class="mb-2"
          />
          <v-textarea
            v-if="kind !== 'INTEREST'"
            v-model="form.description"
            label="Description"
            rows="3"
            auto-grow
            class="mb-2"
          />
          <v-text-field
            v-if="kind === 'PROJECT' || kind === 'CERTIFICATION'"
            v-model="form.url"
            label="Lien (optionnel)"
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
import type { ExtraEntry, ExtraKind } from '~/types/cv'
import { SECTION_META, type SectionKey } from '~/utils/sections'

const props = defineProps<{
  kind: ExtraKind
  sectionKey: SectionKey
}>()

const { resume, addExtra, updateExtra, removeExtra } = useResume()

const dialog = ref(false)
const busy = ref(false)
const editingId = ref<string | null>(null)
const errorMsg = ref('')
const form = reactive({
  title: '',
  subtitle: '',
  dateLabel: '',
  description: '',
  url: '',
})

const items = computed(
  () => (resume.value?.extras || []).filter((e) => e.kind === props.kind),
)
const title = computed(() => SECTION_META[props.sectionKey].fr)
const hint = computed(() => SECTION_META[props.sectionKey].hintFr)
const titleLabel = computed(() =>
  props.kind === 'REFERENCE'
    ? 'Nom *'
    : props.kind === 'INTEREST'
      ? 'Centre d’intérêt *'
      : 'Titre *',
)
const subtitleLabel = computed(() =>
  props.kind === 'REFERENCE'
    ? 'Fonction / relation'
    : props.kind === 'PROJECT'
      ? 'Techno / contexte'
      : 'Organisme / émetteur',
)

function openCreate() {
  editingId.value = null
  form.title = ''
  form.subtitle = ''
  form.dateLabel = ''
  form.description = ''
  form.url = ''
  errorMsg.value = ''
  dialog.value = true
}

function openEdit(item: ExtraEntry) {
  editingId.value = item.id
  form.title = item.title
  form.subtitle = item.subtitle || ''
  form.dateLabel = item.dateLabel || ''
  form.description = item.description || ''
  form.url = item.url || ''
  errorMsg.value = ''
  dialog.value = true
}

async function save() {
  errorMsg.value = ''
  if (!form.title.trim()) {
    errorMsg.value = 'Le titre est obligatoire'
    return
  }
  busy.value = true
  try {
    const payload = {
      kind: props.kind,
      title: form.title.trim(),
      subtitle: form.subtitle || undefined,
      dateLabel: form.dateLabel || undefined,
      description: form.description || undefined,
      url: form.url || undefined,
    }
    if (editingId.value) {
      await updateExtra(editingId.value, payload)
    } else {
      await addExtra(payload)
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
  await removeExtra(id)
}
</script>

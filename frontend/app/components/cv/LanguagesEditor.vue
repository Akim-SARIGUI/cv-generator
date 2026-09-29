<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <h2 class="font-display text-xl">{{ t('tabLanguages') }}</h2>
        <p class="text-sm text-muted">{{ t('hintLanguages') }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">{{ t('btnAdd') }}</v-btn>
    </div>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-3" density="compact">
      {{ errorMsg }}
    </v-alert>

    <div v-if="!items.length" class="text-muted text-sm mb-2">{{ t('emptyLanguages') }}</div>

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
          {{ languageLevelLabel(item.subtitle, 'fr') }}
        </template>
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEdit(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="removeItem(item.id)" />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="520" persistent>
      <v-card class="pa-4">
        <v-card-title class="font-display">
          {{ editingId ? t('dialogLangEdit') : t('dialogLangNew') }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.title"
            label="Langue *"
            placeholder="Français, English, Español…"
            class="mb-2"
          />
          <v-select
            v-model="form.level"
            :items="levelItems"
            item-title="title"
            item-value="value"
            label="Niveau CECR *"
          />
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
import type { ExtraEntry } from '~/types/cv'
import { LANGUAGE_LEVELS, languageLevelLabel } from '~/utils/sections'

const { t, te, locale } = useUiI18n()
const { resume, addExtra, updateExtra, removeExtra } = useResume()

const dialog = ref(false)
const busy = ref(false)
const editingId = ref<string | null>(null)
const errorMsg = ref('')
const form = reactive({
  title: '',
  level: 'B2',
})

const levelItems = LANGUAGE_LEVELS.map((l) => ({
  title: l.fr,
  value: l.value,
}))

const items = computed(() =>
  (resume.value?.extras || []).filter((e) => e.kind === 'LANGUAGE'),
)

function openCreate() {
  editingId.value = null
  form.title = ''
  form.level = 'B2'
  errorMsg.value = ''
  dialog.value = true
}

function openEdit(item: ExtraEntry) {
  editingId.value = item.id
  form.title = item.title
  const match = LANGUAGE_LEVELS.find(
    (l) =>
      l.value === item.subtitle ||
      l.fr === item.subtitle ||
      l.en === item.subtitle,
  )
  form.level = match?.value || 'B2'
  errorMsg.value = ''
  dialog.value = true
}

async function save() {
  errorMsg.value = ''
  if (!form.title.trim()) {
    errorMsg.value = t('infoLanguageRequired')
    return
  }
  busy.value = true
  try {
    const payload = {
      kind: 'LANGUAGE' as const,
      title: form.title.trim(),
      subtitle: languageLevelLabel(form.level, locale.value) || form.level,
    }
    if (editingId.value) {
      await updateExtra(editingId.value, payload)
    } else {
      await addExtra(payload)
    }
    dialog.value = false
  } catch (e: unknown) {
    errorMsg.value = te(e, 'infoSaveFailed')
  } finally {
    busy.value = false
  }
}

async function removeItem(id: string) {
  await removeExtra(id)
}
</script>

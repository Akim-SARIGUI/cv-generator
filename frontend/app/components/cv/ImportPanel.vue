<template>
  <v-card border class="pa-4 md:pa-6">
    <h2 class="font-display text-xl mb-1">{{ t('importTitle') }}</h2>
    <p class="text-sm text-muted mb-4">{{ t('importHint') }}</p>

    <label
      class="dropzone"
      :class="{ 'dropzone--active': dragging, 'dropzone--busy': parsing }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputEl"
        type="file"
        class="hidden"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        @change="onFileInput"
      />
      <v-icon icon="mdi-file-upload-outline" size="36" color="primary" class="mb-2" />
      <p class="font-semibold text-sm">{{ parsing ? t('importParsing') : t('importDrop') }}</p>
      <p class="text-xs text-muted mt-1">{{ t('importFormats') }}</p>
      <v-progress-linear v-if="parsing" indeterminate color="primary" class="mt-4" />
    </label>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-4" density="compact">
      {{ errorMsg }}
    </v-alert>

    <v-alert v-if="successMsg" type="success" variant="tonal" class="mt-4" density="compact">
      {{ successMsg }}
    </v-alert>

    <div v-if="draft" class="mt-5">
      <div class="d-flex flex-wrap align-center justify-space-between gap-2 mb-3">
        <div>
          <p class="font-semibold">{{ t('importPreviewTitle') }}</p>
          <p class="text-xs text-muted">
            {{ draft.meta.sourceName }} · {{ draft.meta.sourceType.toUpperCase() }}
            · {{ draft.meta.textLength }} chars
          </p>
        </div>
        <v-btn variant="text" size="small" @click="reset">{{ t('importAgain') }}</v-btn>
      </div>

      <div class="stats-grid mb-4">
        <div class="stat">
          <p class="stat__label">{{ t('importStatsName') }}</p>
          <p class="stat__value">{{ draft.personal.fullName || '—' }}</p>
        </div>
        <div class="stat">
          <p class="stat__label">{{ t('importStatsExp') }}</p>
          <p class="stat__value">{{ draft.experiences.length }}</p>
        </div>
        <div class="stat">
          <p class="stat__label">{{ t('importStatsEdu') }}</p>
          <p class="stat__value">{{ draft.educations.length }}</p>
        </div>
        <div class="stat">
          <p class="stat__label">{{ t('importStatsSkills') }}</p>
          <p class="stat__value">{{ draft.skills.length }}</p>
        </div>
        <div class="stat">
          <p class="stat__label">{{ t('importStatsLang') }}</p>
          <p class="stat__value">{{ languageCount }}</p>
        </div>
        <div class="stat">
          <p class="stat__label">{{ t('importStatsExtra') }}</p>
          <p class="stat__value">{{ otherExtrasCount }}</p>
        </div>
      </div>

      <v-alert
        v-if="draft.warnings.length"
        type="warning"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        <p class="font-semibold mb-1">{{ t('importWarnings') }}</p>
        <ul class="text-sm pl-4">
          <li v-for="(w, i) in draft.warnings" :key="i">{{ w }}</li>
        </ul>
      </v-alert>

      <div v-if="draft.personal.summary" class="preview-block mb-3">
        <p class="text-xs font-semibold uppercase text-muted mb-1">
          {{ locale === 'en' ? 'Summary' : 'Profil' }}
        </p>
        <p class="text-sm whitespace-pre-wrap line-clamp-4">{{ draft.personal.summary }}</p>
      </div>

      <div v-if="draft.experiences.length" class="preview-block mb-3">
        <p class="text-xs font-semibold uppercase text-muted mb-1">
          {{ locale === 'en' ? 'Experience' : 'Expériences' }}
        </p>
        <ul class="text-sm space-y-1">
          <li v-for="(exp, i) in draft.experiences.slice(0, 4)" :key="i">
            <strong>{{ exp.jobTitle }}</strong>
            <span class="text-muted"> — {{ exp.company }}</span>
          </li>
        </ul>
      </div>

      <div v-if="draft.skills.length" class="preview-block mb-4">
        <p class="text-xs font-semibold uppercase text-muted mb-2">
          {{ locale === 'en' ? 'Skills' : 'Compétences' }}
        </p>
        <div class="d-flex flex-wrap gap-2">
          <span
            v-for="(skill, i) in draft.skills.slice(0, 16)"
            :key="i"
            class="skill-chip"
          >
            {{ skill.name }}
          </span>
        </div>
      </div>

      <p class="text-xs text-muted mb-3">{{ t('importReplaceNote') }}</p>

      <v-btn
        color="primary"
        size="large"
        :loading="applying"
        prepend-icon="mdi-database-import-outline"
        @click="onApply"
      >
        {{ t('importApply') }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { ExtractedCvDraft } from '~/types/cv'

const emit = defineEmits<{
  imported: []
}>()

const { t, locale } = useUiI18n()
const { parseImportedCv, applyImportedCv, saving } = useResume()

const inputEl = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const parsing = ref(false)
const applying = ref(false)
const draft = ref<ExtractedCvDraft | null>(null)
const errorMsg = ref('')
const successMsg = ref('')

const languageCount = computed(
  () => draft.value?.extras.filter((e) => e.kind === 'LANGUAGE').length || 0,
)
const otherExtrasCount = computed(
  () => draft.value?.extras.filter((e) => e.kind !== 'LANGUAGE').length || 0,
)

function reset() {
  draft.value = null
  errorMsg.value = ''
  successMsg.value = ''
  if (inputEl.value) inputEl.value.value = ''
}

async function handleFile(file: File | undefined | null) {
  if (!file) return
  dragging.value = false
  errorMsg.value = ''
  successMsg.value = ''
  draft.value = null
  parsing.value = true
  try {
    draft.value = await parseImportedCv(file)
  } catch {
    errorMsg.value = t('importError')
  } finally {
    parsing.value = false
  }
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  handleFile(input.files?.[0])
}

function onDrop(event: DragEvent) {
  dragging.value = false
  handleFile(event.dataTransfer?.files?.[0])
}

async function onApply() {
  if (!draft.value || applying.value || saving.value) return
  applying.value = true
  errorMsg.value = ''
  try {
    await applyImportedCv(draft.value, true)
    successMsg.value = t('importSuccess')
    emit('imported')
  } catch {
    errorMsg.value = t('importError')
  } finally {
    applying.value = false
  }
}
</script>

<style scoped>
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1.5px dashed var(--cv-line);
  border-radius: 14px;
  padding: 1.75rem 1rem;
  background: #faf9f7;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.dropzone:hover,
.dropzone--active {
  border-color: #1e3a5f;
  background: rgba(30, 58, 95, 0.04);
}
.dropzone--busy {
  pointer-events: none;
  opacity: 0.85;
}
.hidden {
  display: none;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.65rem;
}
.stat {
  border: 1px solid var(--cv-line);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  background: #fff;
}
.stat__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--cv-muted);
}
.stat__value {
  font-size: 0.95rem;
  font-weight: 650;
  margin-top: 0.15rem;
  word-break: break-word;
}
.preview-block {
  border: 1px solid var(--cv-line);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  background: #fff;
}
.skill-chip {
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  border: 1px solid var(--cv-line);
  background: #f8fafc;
}
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.space-y-1 > * + * {
  margin-top: 0.25rem;
}
</style>

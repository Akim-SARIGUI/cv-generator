<template>
  <div class="page-shell">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-6">
      <div>
        <h1 class="font-display text-3xl text-ink">{{ t('previewTitle') }}</h1>
        <p class="text-muted">
          {{ t('modelLabel') }} <strong>{{ templateLabel }}</strong>
          · {{ (resume?.locale || 'fr').toUpperCase() }}
          <span v-if="localizing"> · {{ t('translating') }}</span>
        </p>
      </div>
      <div class="d-flex flex-wrap align-center gap-3">
        <CvLocaleSwitch :label="t('language')" />
        <v-btn variant="outlined" color="primary" to="/editor">{{ t('backEditor') }}</v-btn>
        <v-btn color="primary" prepend-icon="mdi-download" @click="downloadOpen = true">
          {{ t('downloadPdf') }}
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading || localizing" indeterminate color="primary" class="mb-4" />
    <v-alert v-else-if="error" type="error" variant="tonal">{{ error }}</v-alert>
    <CvResumePreview v-else :resume="localizedResume || resume" />

    <CvDownloadDialog
      v-model="downloadOpen"
      :loading="downloading"
      @confirm="onDownload"
    />
  </div>
</template>

<script setup lang="ts">
import type { CvLocale } from '~/utils/cv-templates'

const { t, locale } = useUiI18n()
const {
  resume,
  localizedResume,
  localizing,
  loading,
  error,
  loadDefault,
  downloadPdf,
  refreshLocalized,
} = useResume()
const { findTemplate, loadTemplates } = useTemplates()

const downloading = ref(false)
const downloadOpen = ref(false)

const templateLabel = computed(() => {
  const meta = findTemplate(resume.value?.template)
  return locale.value === 'en' ? meta.nameEn : meta.name
})

onMounted(async () => {
  await Promise.all([loadDefault(), loadTemplates()])
  if (!localizedResume.value) {
    await refreshLocalized()
  }
})

async function onDownload(lang: CvLocale) {
  downloading.value = true
  try {
    await downloadPdf(lang)
    downloadOpen.value = false
  } finally {
    downloading.value = false
  }
}
</script>

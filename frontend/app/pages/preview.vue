<template>
  <div class="page-shell">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-6">
      <div>
        <h1 class="font-display text-3xl text-ink">Aperçu</h1>
        <p class="text-muted">
          Modèle <strong>{{ templateLabel }}</strong>
          · langue {{ (resume?.locale || 'fr').toUpperCase() }}
          <span v-if="localizing"> · traduction…</span>
        </p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <v-btn variant="outlined" color="primary" to="/editor">Retour éditeur</v-btn>
        <v-btn color="primary" :loading="downloading" prepend-icon="mdi-download" @click="onDownload">
          Télécharger PDF
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading || localizing" indeterminate color="primary" class="mb-4" />
    <v-alert v-else-if="error" type="error" variant="tonal">{{ error }}</v-alert>
    <CvResumePreview v-else :resume="localizedResume || resume" />
  </div>
</template>

<script setup lang="ts">
import { getTemplateMeta, resolveLocale } from '~/utils/cv-templates'

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
const downloading = ref(false)

const templateLabel = computed(() => {
  const meta = getTemplateMeta(resume.value?.template)
  return resolveLocale(resume.value?.locale) === 'en' ? meta.nameEn : meta.name
})

onMounted(async () => {
  await loadDefault()
  if (!localizedResume.value) {
    await refreshLocalized()
  }
})

async function onDownload() {
  downloading.value = true
  try {
    await downloadPdf()
  } finally {
    downloading.value = false
  }
}
</script>

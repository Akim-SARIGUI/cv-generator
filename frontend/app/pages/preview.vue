<template>
  <div class="page-shell">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-6">
      <div>
        <h1 class="font-display text-3xl text-ink">Aperçu</h1>
        <p class="text-muted">Vérifiez le rendu avant d’exporter le PDF</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <v-btn variant="outlined" color="primary" to="/editor">Retour éditeur</v-btn>
        <v-btn color="primary" :loading="downloading" prepend-icon="mdi-download" @click="onDownload">
          Télécharger PDF
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
    <v-alert v-else-if="error" type="error" variant="tonal">{{ error }}</v-alert>
    <CvResumePreview v-else :resume="resume" />
  </div>
</template>

<script setup lang="ts">
const { resume, loading, error, loadDefault, downloadPdf } = useResume()
const downloading = ref(false)

onMounted(async () => {
  await loadDefault()
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

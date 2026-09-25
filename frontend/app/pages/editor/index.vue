<template>
  <div class="page-shell">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-6">
      <div>
        <h1 class="font-display text-3xl text-ink">Éditeur de CV</h1>
        <p class="text-muted">
          {{ resume?.title || 'Chargement…' }}
          <span v-if="resume?.personal?.fullName"> · {{ resume.personal.fullName }}</span>
        </p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <v-btn variant="outlined" color="primary" to="/preview">Aperçu</v-btn>
        <v-btn color="primary" :loading="downloading" prepend-icon="mdi-download" @click="onDownload">
          Télécharger PDF
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <div v-else class="grid gap-5">
      <CvPersonalForm />
      <CvExperienceEditor />
      <CvEducationEditor />
      <CvSkillsEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
const { resume, loading, error, loadDefault, downloadPdf } = useResume()
const downloading = ref(false)

onMounted(async () => {
  if (!resume.value) {
    await loadDefault()
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

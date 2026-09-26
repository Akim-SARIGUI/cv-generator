<template>
  <div class="page-shell">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-6">
      <div>
        <h1 class="font-display text-3xl text-ink">{{ t('editorTitle') }}</h1>
        <p class="text-muted">
          {{ resume?.title || t('loading') }}
          <span v-if="resume?.personal?.fullName"> · {{ resume.personal.fullName }}</span>
        </p>
      </div>
      <div class="d-flex flex-wrap align-center gap-3">
        <CvLocaleSwitch :label="t('language')" />
        <v-btn variant="outlined" color="primary" to="/preview">{{ t('preview') }}</v-btn>
        <v-btn color="primary" prepend-icon="mdi-download" @click="downloadOpen = true">
          {{ t('downloadPdf') }}
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-else>
      <v-tabs v-model="tab" color="primary" class="mb-4 editor-tabs" show-arrows>
        <v-tab value="structure">{{ t('tabStructure') }}</v-tab>
        <v-tab value="model">{{ t('tabModel') }}</v-tab>
        <v-tab value="profile">{{ t('tabProfile') }}</v-tab>
        <v-tab v-if="sections.experience" value="experience">{{ t('tabExperience') }}</v-tab>
        <v-tab v-if="sections.education" value="education">{{ t('tabEducation') }}</v-tab>
        <v-tab v-if="sections.skills" value="skills">{{ t('tabSkills') }}</v-tab>
        <v-tab v-if="sections.languages" value="languages">{{ t('tabLanguages') }}</v-tab>
        <v-tab v-if="sections.certifications" value="certifications">{{ t('tabCertifications') }}</v-tab>
        <v-tab v-if="sections.awards" value="awards">{{ t('tabAwards') }}</v-tab>
        <v-tab v-if="sections.projects" value="projects">{{ t('tabProjects') }}</v-tab>
        <v-tab v-if="sections.interests" value="interests">{{ t('tabInterests') }}</v-tab>
        <v-tab v-if="sections.references" value="references">{{ t('tabReferences') }}</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="structure">
          <CvSectionsManager />
        </v-tabs-window-item>
        <v-tabs-window-item value="model">
          <CvTemplatePicker />
        </v-tabs-window-item>
        <v-tabs-window-item value="profile">
          <CvPersonalForm />
        </v-tabs-window-item>
        <v-tabs-window-item value="experience">
          <CvExperienceEditor />
        </v-tabs-window-item>
        <v-tabs-window-item value="education">
          <CvEducationEditor />
        </v-tabs-window-item>
        <v-tabs-window-item value="skills">
          <CvSkillsEditor />
        </v-tabs-window-item>
        <v-tabs-window-item value="languages">
          <CvLanguagesEditor />
        </v-tabs-window-item>
        <v-tabs-window-item value="certifications">
          <CvExtrasEditor kind="CERTIFICATION" section-key="certifications" />
        </v-tabs-window-item>
        <v-tabs-window-item value="awards">
          <CvExtrasEditor kind="AWARD" section-key="awards" />
        </v-tabs-window-item>
        <v-tabs-window-item value="projects">
          <CvExtrasEditor kind="PROJECT" section-key="projects" />
        </v-tabs-window-item>
        <v-tabs-window-item value="interests">
          <CvExtrasEditor kind="INTEREST" section-key="interests" />
        </v-tabs-window-item>
        <v-tabs-window-item value="references">
          <CvExtrasEditor kind="REFERENCE" section-key="references" />
        </v-tabs-window-item>
      </v-tabs-window>
    </template>

    <CvDownloadDialog
      v-model="downloadOpen"
      :loading="downloading"
      @confirm="onDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { normalizeSections } from '~/utils/sections'
import type { CvLocale } from '~/utils/cv-templates'

const { t } = useUiI18n()
const { resume, loading, error, loadDefault, downloadPdf } = useResume()
const downloading = ref(false)
const downloadOpen = ref(false)
const tab = ref('model')

const sections = computed(() => normalizeSections(resume.value?.sections))

watch(sections, (s) => {
  if (!s[tab.value as keyof typeof s] && !['structure', 'model', 'profile'].includes(tab.value)) {
    tab.value = 'structure'
  }
})

onMounted(async () => {
  if (!resume.value) {
    await loadDefault()
  }
})

async function onDownload(locale: CvLocale) {
  downloading.value = true
  try {
    await downloadPdf(locale)
    downloadOpen.value = false
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.editor-tabs {
  border-bottom: 1px solid var(--cv-line);
}
</style>

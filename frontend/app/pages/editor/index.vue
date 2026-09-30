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

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error === 'RESUME_LOAD' ? t('errResumeLoad') : error }}
    </v-alert>
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-else>
      <div class="editor-layout">
        <nav class="editor-nav" :aria-label="t('editorTitle')">
          <button
            v-for="(step, index) in steps"
            :key="step.id"
            type="button"
            class="editor-step"
            :class="{ 'editor-step--on': tab === step.id }"
            @click="tab = step.id"
          >
            <span class="editor-step__index">{{ index + 1 }}</span>
            <span>
              <span class="editor-step__title">{{ step.title }}</span>
              <span class="editor-step__hint">{{ step.hint }}</span>
            </span>
          </button>
        </nav>

        <div class="editor-panel">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="import">
          <CvImportPanel @imported="onImported" />
        </v-tabs-window-item>
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
        </div>
      </div>
    </template>

    <CvDownloadDialog
      v-model="downloadOpen"
      :loading="downloading"
      @confirm="onDownload"
    />
  </div>
</template>

<script setup lang="ts">
import { SECTION_META, normalizeSections, sectionOrder, type SectionKey } from '~/utils/sections'
import type { CvLocale } from '~/utils/cv-templates'

const { t, locale } = useUiI18n()
const route = useRoute()
const { resume, loading, error, loadDefault, loadById, downloadPdf } = useResume()
const downloading = ref(false)
const downloadOpen = ref(false)
const tab = ref('import')

const sections = computed(() => normalizeSections(resume.value?.sections))

const steps = computed(() => {
  const content = sectionOrder(resume.value?.sections).filter((key) => {
    if (key === 'profile' || key === 'objective') return false
    return sections.value[key]
  })
  const label = (key: SectionKey) =>
    locale.value === 'en' ? SECTION_META[key].en : SECTION_META[key].fr
  const hint = (key: SectionKey) =>
    locale.value === 'en' ? SECTION_META[key].hintEn : SECTION_META[key].hintFr
  return [
    { id: 'import', title: t('tabImport'), hint: t('stepImportHint') },
    { id: 'structure', title: t('tabStructure'), hint: t('stepStructureHint') },
    { id: 'profile', title: t('tabProfile'), hint: t('stepProfileHint') },
    ...content.map((key) => ({ id: key, title: label(key), hint: hint(key) })),
    { id: 'model', title: t('tabModel'), hint: t('stepModelHint') },
  ]
})

watch(sections, (s) => {
  if (
    !s[tab.value as keyof typeof s] &&
    !['import', 'structure', 'model', 'profile'].includes(tab.value)
  ) {
    tab.value = 'structure'
  }
})

async function openFromRoute() {
  const id = typeof route.query.id === 'string' ? route.query.id : ''
  if (id) {
    if (resume.value?.id !== id) await loadById(id)
    return
  }
  if (!resume.value) await loadDefault()
}

onMounted(openFromRoute)
watch(() => route.query.id, () => {
  void openFromRoute()
})

function onImported() {
  tab.value = 'profile'
}

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
.editor-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: start;
}
.editor-nav {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: sticky;
  top: 1rem;
}
.editor-step {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  text-align: left;
  width: 100%;
  border: 1px solid var(--cv-line);
  background: #fff;
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
}
.editor-step--on {
  border-color: rgba(15, 118, 110, 0.45);
  background: rgba(15, 118, 110, 0.06);
}
.editor-step__index {
  flex: 0 0 auto;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: #eef2f4;
  color: var(--cv-ink);
}
.editor-step--on .editor-step__index {
  background: var(--cv-accent);
  color: #fff;
}
.editor-step__title {
  display: block;
  font-weight: 650;
  font-size: 0.92rem;
  line-height: 1.25;
  color: var(--cv-ink);
}
.editor-step__hint {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--cv-muted);
}
@media (max-width: 960px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
  .editor-nav {
    position: static;
  }
}
</style>

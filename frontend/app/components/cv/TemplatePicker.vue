<template>
  <div class="template-studio">
    <header class="template-studio__header">
      <div>
        <h2 class="font-display text-xl text-ink">{{ t('templatesTitle') }}</h2>
        <p class="text-sm text-muted mt-1">{{ t('templatesHint') }}</p>
      </div>
      <CvLocaleSwitch :label="t('language')" />
    </header>

    <div class="template-studio__body">
      <!-- Types -->
      <aside class="template-studio__types" aria-label="Template types">
        <button
          v-for="fam in families"
          :key="fam.id"
          type="button"
          class="type-btn"
          :class="{ 'type-btn--active': layoutFilter === fam.id }"
          @click="layoutFilter = fam.id"
        >
          <span class="type-btn__label">{{ t(fam.label) }}</span>
          <span class="type-btn__count">{{ counts[fam.id] || 0 }}</span>
        </button>
      </aside>

      <!-- Liste modèles -->
      <section class="template-studio__list">
        <div class="list-toolbar">
          <div>
            <p class="text-sm font-semibold text-ink">{{ activeFamilyTitle }}</p>
            <p class="text-xs text-muted">{{ activeFamilyDesc }}</p>
          </div>
          <v-text-field
            v-model="query"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="list-search"
            prepend-inner-icon="mdi-magnify"
            :placeholder="t('templatesSearch')"
          />
        </div>

        <p class="text-xs text-muted mb-3">
          {{ t('templatesCount', { total: total || catalog.length, shown: filtered.length }) }}
        </p>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />
        <v-alert v-else-if="loadError" type="warning" variant="tonal" density="compact" class="mb-3">
          {{ t('templatesLoadError') }}
        </v-alert>

        <div v-if="filtered.length" class="model-grid">
          <button
            v-for="item in filtered"
            :key="item.id"
            type="button"
            class="model-card"
            :class="{ 'model-card--active': selected === item.id }"
            @click="onSelect(item.id)"
            @mouseenter="hoverId = item.id"
            @mouseleave="hoverId = null"
            @focus="hoverId = item.id"
            @blur="hoverId = null"
          >
            <div class="model-thumb" :style="{ '--accent': item.accent }">
              <div :class="`thumb-${item.layout}`">
                <span v-if="item.showsPhoto" class="thumb-photo" />
              </div>
              <span v-if="selected === item.id" class="model-badge">
                {{ t('templatesSelected') }}
              </span>
            </div>
            <p class="model-name">
              {{ locale === 'en' ? item.nameEn : item.name }}
            </p>
            <p class="model-desc">
              {{ locale === 'en' ? item.descriptionEn : item.description }}
            </p>
            <p v-if="!item.showsPhoto" class="model-meta">{{ t('templatesNoPhoto') }}</p>
          </button>
        </div>
        <v-alert v-else type="info" variant="tonal" density="compact">
          {{ t('templatesEmpty') }}
        </v-alert>
      </section>

      <!-- Aperçu live -->
      <aside class="template-studio__preview">
        <div class="preview-panel">
          <div class="preview-panel__head">
            <div>
              <p class="text-sm font-semibold">{{ t('templatesLivePreview') }}</p>
              <p class="text-xs text-muted">
                {{ previewLabel }}
                <span v-if="saving || localizing"> · {{ t('templatesApplying') }}</span>
              </p>
            </div>
            <CvLocaleSwitch compact />
          </div>
          <div class="preview-panel__stage">
            <div class="preview-scale">
              <CvResumePreview
                v-if="previewResume"
                :resume="previewResume"
                class="preview-paper"
              />
              <div v-else class="preview-empty text-muted text-sm">
                {{ t('loading') }}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  resolveLocale,
  resolveTemplate,
  type LayoutId,
  type TemplateId,
} from '~/utils/cv-templates'
import { FAMILY_KEYS } from '~/composables/useUiI18n'
import type { Resume } from '~/types/cv'

const { t, locale } = useUiI18n()
const { resume, localizedResume, localizing, updateResume, saving } = useResume()
const { templates, total, loading, error: loadError, loadTemplates } = useTemplates()

const query = ref('')
const layoutFilter = ref<LayoutId | 'all'>('all')
const hoverId = ref<string | null>(null)

const selected = computed(() => resolveTemplate(resume.value?.template))
const catalog = computed(() => templates.value)
const families = FAMILY_KEYS

const counts = computed(() => {
  const map: Record<string, number> = { all: catalog.value.length }
  for (const item of catalog.value) {
    map[item.layout] = (map[item.layout] || 0) + 1
  }
  return map
})

const activeFamily = computed(
  () => families.find((f) => f.id === layoutFilter.value) || families[0],
)
const activeFamilyTitle = computed(() => t(activeFamily.value.label))
const activeFamilyDesc = computed(() => t(activeFamily.value.desc))

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return catalog.value.filter((item) => {
    if (layoutFilter.value !== 'all' && item.layout !== layoutFilter.value) return false
    if (!q) return true
    return (
      item.id.includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.descriptionEn.toLowerCase().includes(q)
    )
  })
})

const previewTemplateId = computed(() => hoverId.value || selected.value)

const previewResume = computed<Resume | null>(() => {
  const base = localizedResume.value || resume.value
  if (!base) return null
  return {
    ...base,
    template: previewTemplateId.value,
    locale: resume.value?.locale || base.locale,
  }
})

const previewLabel = computed(() => {
  const item = catalog.value.find((t) => t.id === previewTemplateId.value)
  if (!item) return previewTemplateId.value
  return locale.value === 'en' ? item.nameEn : item.name
})

const familySynced = ref(false)

onMounted(async () => {
  await loadTemplates()
  syncFamilyFromSelection()
})

watch(catalog, () => {
  if (!familySynced.value) syncFamilyFromSelection()
})

function syncFamilyFromSelection() {
  const current = catalog.value.find((item) => item.id === selected.value)
  if (current) {
    layoutFilter.value = current.layout
    familySynced.value = true
  }
}

async function onSelect(id: TemplateId) {
  if (!resume.value || selected.value === id || saving.value) return
  hoverId.value = null
  await updateResume({ template: id })
}
</script>

<style scoped>
.template-studio {
  border: 1px solid var(--cv-line);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}
.template-studio__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid var(--cv-line);
  background: linear-gradient(180deg, #fbfaf8 0%, #fff 100%);
}
.template-studio__body {
  display: grid;
  grid-template-columns: 200px minmax(280px, 1fr) minmax(320px, 0.95fr);
  min-height: 640px;
}
.template-studio__types {
  border-right: 1px solid var(--cv-line);
  padding: 0.75rem;
  background: #faf9f7;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}
.type-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  text-align: left;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  margin-bottom: 0.25rem;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.type-btn:hover {
  background: #fff;
  border-color: var(--cv-line);
}
.type-btn--active {
  background: #fff;
  border-color: #1e3a5f;
  box-shadow: 0 0 0 1px rgba(30, 58, 95, 0.12);
}
.type-btn__label {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--cv-ink);
}
.type-btn__count {
  font-size: 0.72rem;
  color: var(--cv-muted);
  background: #eef2f7;
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  min-width: 1.6rem;
  text-align: center;
}
.template-studio__list {
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
}
.list-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.list-search {
  width: min(100%, 260px);
}
.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}
.model-card {
  text-align: left;
  border: 1px solid var(--cv-line);
  border-radius: 12px;
  padding: 0.7rem;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.model-card:hover {
  border-color: #94a3b8;
  transform: translateY(-1px);
}
.model-card--active {
  border-color: #1e3a5f;
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.14);
}
.model-thumb {
  height: 72px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  overflow: hidden;
  position: relative;
}
.model-badge {
  position: absolute;
  left: 6px;
  bottom: 6px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #fff;
  background: #1e3a5f;
  border-radius: 4px;
  padding: 0.15rem 0.35rem;
}
.model-name {
  font-size: 0.82rem;
  font-weight: 650;
  margin-top: 0.45rem;
  line-height: 1.25;
}
.model-desc {
  font-size: 0.7rem;
  color: var(--cv-muted);
  margin-top: 0.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.model-meta {
  font-size: 0.68rem;
  color: var(--cv-accent);
  margin-top: 0.25rem;
}
.template-studio__preview {
  border-left: 1px solid var(--cv-line);
  background: #f3f1ec;
  padding: 0.85rem;
  max-height: calc(100vh - 180px);
  overflow: hidden;
}
.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.preview-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.preview-panel__stage {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.35), transparent 40%),
    repeating-linear-gradient(
      -12deg,
      transparent,
      transparent 10px,
      rgba(20, 33, 61, 0.015) 10px,
      rgba(20, 33, 61, 0.015) 11px
    );
  padding: 0.75rem;
}
.preview-scale {
  transform-origin: top center;
  transform: scale(0.58);
  width: 172.4%;
  margin-left: -36.2%;
}
.preview-paper {
  box-shadow: 0 12px 40px rgba(20, 33, 61, 0.12);
}
.preview-empty {
  padding: 2rem;
  text-align: center;
}
.thumb-photo {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 16px;
  height: 22px;
  border-radius: 3px;
  background: linear-gradient(145deg, #94a3b8, #64748b);
}
.thumb-classic,
.thumb-ats,
.thumb-minimal,
.thumb-executive,
.thumb-elegant,
.thumb-timeline,
.thumb-banner,
.thumb-twocol,
.thumb-sidebar {
  height: 100%;
  padding: 10px;
}
.thumb-classic::before,
.thumb-executive::before {
  content: '';
  display: block;
  width: 48%;
  height: 6px;
  background: var(--accent);
  border-radius: 2px;
  margin-bottom: 8px;
}
.thumb-classic::after,
.thumb-ats::after,
.thumb-executive::after,
.thumb-elegant::after,
.thumb-timeline::after {
  content: '';
  display: block;
  width: 78%;
  height: 3px;
  background: #dbe3ea;
  box-shadow: 0 8px 0 #e8eef3, 0 16px 0 #e8eef3, 0 24px 0 #e8eef3;
}
.thumb-ats::before {
  content: '';
  display: block;
  width: 40%;
  height: 5px;
  margin: 0 auto 8px;
  background: var(--accent);
  border-radius: 2px;
}
.thumb-sidebar {
  background: linear-gradient(var(--accent), var(--accent)) left / 32% 100% no-repeat, #fff;
  padding: 0;
}
.thumb-minimal::before {
  content: '';
  display: block;
  width: 55%;
  height: 8px;
  background: var(--accent);
  margin-bottom: 10px;
}
.thumb-banner {
  padding: 0;
  background: linear-gradient(var(--accent), var(--accent)) top / 100% 34% no-repeat, #fff;
}
.thumb-twocol {
  background:
    linear-gradient(#e2e8f0, #e2e8f0) left 8px top 12px / 28% 70% no-repeat,
    linear-gradient(#e2e8f0, #e2e8f0) right 8px top 12px / 52% 70% no-repeat,
    #fff;
}
.thumb-timeline::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--accent);
}
.thumb-elegant::before {
  content: '';
  display: block;
  width: 50%;
  height: 7px;
  margin: 0 auto 8px;
  background: var(--accent);
  border-radius: 2px;
}

@media (max-width: 1100px) {
  .template-studio__body {
    grid-template-columns: 170px 1fr;
  }
  .template-studio__preview {
    grid-column: 1 / -1;
    border-left: none;
    border-top: 1px solid var(--cv-line);
    max-height: 520px;
  }
  .preview-scale {
    transform: scale(0.48);
    width: 208.3%;
    margin-left: -54.15%;
  }
}

@media (max-width: 720px) {
  .template-studio__body {
    grid-template-columns: 1fr;
  }
  .template-studio__types {
    display: flex;
    gap: 0.35rem;
    overflow-x: auto;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--cv-line);
  }
  .type-btn {
    width: auto;
    white-space: nowrap;
    margin-bottom: 0;
    flex-shrink: 0;
  }
  .template-studio__list {
    max-height: none;
  }
}
</style>

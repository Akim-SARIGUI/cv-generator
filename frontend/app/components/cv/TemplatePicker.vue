<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
      <div>
        <h2 class="font-display text-xl">Modèle de CV</h2>
        <p class="text-sm text-muted">
          {{ TEMPLATES.length }} modèles professionnels · la langue traduit tout le rendu
        </p>
      </div>
      <v-btn-toggle
        :model-value="locale"
        mandatory
        density="comfortable"
        color="primary"
        variant="outlined"
        divided
        @update:model-value="onLocale"
      >
        <v-btn value="fr" size="small">FR</v-btn>
        <v-btn value="en" size="small">EN</v-btn>
      </v-btn-toggle>
    </div>

    <v-alert type="info" variant="tonal" density="compact" class="mb-4">
      FR ou EN applique les libellés <strong>et</strong> traduit le contenu du CV dans la langue choisie
      (aperçu + PDF), même si vous avez saisi les textes dans l’autre langue.
    </v-alert>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <button
        v-for="item in TEMPLATES"
        :key="item.id"
        type="button"
        class="template-card text-left"
        :class="{ 'template-card--active': selected === item.id }"
        @click="onSelect(item.id)"
      >
        <div class="template-thumb" :style="{ '--accent': item.accent }">
          <div :class="`thumb-${item.layout}`">
            <span v-if="item.showsPhoto" class="thumb-photo" />
          </div>
        </div>
        <p class="font-semibold text-sm mt-2">
          {{ locale === 'en' ? item.nameEn : item.name }}
        </p>
        <p class="text-xs text-muted mt-1">
          {{ locale === 'en' ? item.descriptionEn : item.description }}
        </p>
        <p v-if="!item.showsPhoto" class="text-[11px] text-accent mt-1">
          {{ locale === 'en' ? 'No photo' : 'Sans photo' }}
        </p>
      </button>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { TEMPLATES, resolveLocale, resolveTemplate, type CvLocale, type TemplateId } from '~/utils/cv-templates'

const { resume, updateResume, saving, refreshLocalized } = useResume()

const selected = computed(() => resolveTemplate(resume.value?.template))
const locale = computed(() => resolveLocale(resume.value?.locale))

async function onSelect(id: TemplateId) {
  if (!resume.value || selected.value === id || saving.value) return
  await updateResume({ template: id })
  await refreshLocalized()
}

async function onLocale(value: unknown) {
  const next = resolveLocale(String(value)) as CvLocale
  if (!resume.value || locale.value === next || saving.value) return
  await updateResume({ locale: next })
  await refreshLocalized()
}
</script>

<style scoped>
.template-card {
  border: 1px solid var(--cv-line);
  border-radius: 14px;
  padding: 0.85rem;
  background: #fff;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.template-card:hover {
  border-color: #94a3b8;
  transform: translateY(-1px);
}
.template-card--active {
  border-color: #1e3a5f;
  box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.15);
}
.template-thumb {
  height: 84px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  overflow: hidden;
  position: relative;
}
.thumb-photo {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 18px;
  height: 24px;
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
  padding: 12px;
}
.thumb-classic::before,
.thumb-executive::before {
  content: '';
  display: block;
  width: 48%;
  height: 7px;
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
  box-shadow: 0 9px 0 #e8eef3, 0 18px 0 #e8eef3, 0 27px 0 #e8eef3;
}
.thumb-ats::before {
  content: '';
  display: block;
  width: 40%;
  height: 6px;
  margin: 0 auto 10px;
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
  height: 9px;
  background: var(--accent);
  margin-bottom: 12px;
}
.thumb-banner {
  padding: 0;
  background: linear-gradient(var(--accent), var(--accent)) top / 100% 34% no-repeat, #fff;
}
.thumb-twocol {
  background:
    linear-gradient(#e2e8f0, #e2e8f0) left 10px top 14px / 28% 70% no-repeat,
    linear-gradient(#e2e8f0, #e2e8f0) right 10px top 14px / 52% 70% no-repeat,
    #fff;
}
.thumb-timeline::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 14px;
  bottom: 14px;
  width: 2px;
  background: var(--accent);
}
.thumb-elegant::before {
  content: '';
  display: block;
  width: 50%;
  height: 8px;
  margin: 0 auto 10px;
  background: var(--accent);
  border-radius: 2px;
}
</style>

<template>
  <v-card border class="pa-4 md:pa-6">
    <h2 class="font-display text-xl mb-1">Structure du CV</h2>
    <p class="text-sm text-muted mb-4">
      Activez uniquement les blocs que vous voulez afficher. Les titres suivent la langue FR/EN.
    </p>

    <div class="grid gap-3 sm:grid-cols-2">
      <label
        v-for="key in SECTION_KEYS"
        :key="key"
        class="section-toggle"
        :class="{ 'section-toggle--on': local[key] }"
      >
        <div class="flex-grow-1">
          <p class="font-semibold text-sm">{{ SECTION_META[key].fr }}</p>
          <p class="text-xs text-muted">{{ SECTION_META[key].hintFr }}</p>
        </div>
        <v-switch
          :model-value="local[key]"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="(v) => toggle(key, Boolean(v))"
        />
      </label>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  DEFAULT_SECTIONS,
  SECTION_KEYS,
  SECTION_META,
  normalizeSections,
  type SectionKey,
  type SectionsConfig,
} from '~/utils/sections'

const { resume, updateResume, saving } = useResume()

const local = reactive<SectionsConfig>({ ...DEFAULT_SECTIONS })

watch(
  () => resume.value?.sections,
  (value) => {
    Object.assign(local, normalizeSections(value))
  },
  { immediate: true, deep: true },
)

async function toggle(key: SectionKey, enabled: boolean) {
  local[key] = enabled
  if (!resume.value || saving.value) return
  await updateResume({ sections: { ...local } })
}
</script>

<style scoped>
.section-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--cv-line);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  background: #fff;
  cursor: pointer;
}
.section-toggle--on {
  border-color: rgba(30, 58, 95, 0.35);
  background: rgba(30, 58, 95, 0.03);
}
</style>

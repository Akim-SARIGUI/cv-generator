<template>
  <v-card border class="pa-4 md:pa-6">
    <h2 class="font-display text-xl mb-1">{{ t('structureTitle') }}</h2>
    <p class="text-sm text-muted mb-4">{{ t('structureHint') }}</p>
    <p class="text-xs text-muted mb-3">{{ t('dragHint') }}</p>

    <div class="sections-list">
      <article
        v-for="(key, index) in order"
        :key="key"
        class="section-row"
        :class="{ 'section-row--on': local[key] }"
        @dragover.prevent
        @drop="drop(index)"
      >
        <button
          type="button"
          class="drag-handle"
          draggable="true"
          :aria-label="t('dragHint')"
          @dragstart="start(index, $event)"
        >
          <v-icon icon="mdi-drag" size="small" />
        </button>
        <div class="flex-grow-1">
          <p class="font-semibold text-sm leading-snug">
            {{ locale === 'en' ? SECTION_META[key].en : SECTION_META[key].fr }}
          </p>
          <p class="text-xs text-muted mt-0.5">
            {{ locale === 'en' ? SECTION_META[key].hintEn : SECTION_META[key].hintFr }}
          </p>
        </div>
        <v-switch
          :model-value="local[key]"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="(v) => toggle(key, Boolean(v))"
        />
      </article>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import {
  DEFAULT_SECTIONS,
  SECTION_META,
  normalizeSections,
  packSections,
  sectionOrder,
  type SectionKey,
  type SectionsConfig,
} from '~/utils/sections'

const { t, locale } = useUiI18n()
const { resume, updateResume, saving } = useResume()

const local = reactive<SectionsConfig>({ ...DEFAULT_SECTIONS })
const order = ref<SectionKey[]>(sectionOrder(null))
const dragFrom = ref<number | null>(null)

watch(
  () => resume.value?.sections,
  (value) => {
    Object.assign(local, normalizeSections(value))
    order.value = sectionOrder(value)
  },
  { immediate: true, deep: true },
)

async function persist() {
  if (!resume.value || saving.value) return
  await updateResume({ sections: packSections({ ...local }, order.value) })
}

async function toggle(key: SectionKey, enabled: boolean) {
  local[key] = enabled
  await persist()
}

function start(index: number, event: DragEvent) {
  dragFrom.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

async function drop(index: number) {
  const from = dragFrom.value
  dragFrom.value = null
  if (from == null || from === index) return
  const next = order.value.slice()
  const [moved] = next.splice(from, 1)
  if (!moved) return
  next.splice(index, 0, moved)
  order.value = next
  await persist()
}
</script>

<style scoped>
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.section-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--cv-line);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  background: #fff;
}
.section-row--on {
  border-color: rgba(15, 118, 110, 0.35);
  background: rgba(15, 118, 110, 0.04);
}
.drag-handle {
  cursor: grab;
  color: #8b97a3;
  display: grid;
  place-items: center;
  padding: 0.15rem;
}
</style>

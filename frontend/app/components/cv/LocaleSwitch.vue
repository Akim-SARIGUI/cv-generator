<template>
  <div class="locale-switch" :class="{ 'locale-switch--compact': compact }">
    <span v-if="label" class="locale-switch__label text-muted">{{ label }}</span>
    <v-btn-toggle
      :model-value="locale"
      mandatory
      density="comfortable"
      color="primary"
      variant="outlined"
      divided
      :disabled="disabled || saving"
      @update:model-value="onChange"
    >
      <v-btn value="fr" size="small">FR</v-btn>
      <v-btn value="en" size="small">EN</v-btn>
    </v-btn-toggle>
  </div>
</template>

<script setup lang="ts">
import { resolveLocale, type CvLocale } from '~/utils/cv-templates'

const props = withDefaults(
  defineProps<{
    label?: string
    compact?: boolean
    disabled?: boolean
    persist?: boolean
  }>(),
  {
    label: '',
    compact: false,
    disabled: false,
    persist: true,
  },
)

const emit = defineEmits<{
  change: [locale: CvLocale]
}>()

const { resume, updateResume, saving } = useResume()
const { locale, setUiLocale } = useUiI18n()

async function onChange(value: unknown) {
  const next = resolveLocale(String(value)) as CvLocale
  if (locale.value === next || props.disabled || saving.value) return
  setUiLocale(next)
  if (props.persist && resume.value) {
    await updateResume({ locale: next })
  }
  emit('change', next)
}
</script>

<style scoped>
.locale-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
}
.locale-switch__label {
  font-size: 0.8rem;
  white-space: nowrap;
}
</style>

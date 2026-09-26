<template>
  <v-dialog :model-value="modelValue" max-width="440" @update:model-value="emit('update:modelValue', $event)">
    <v-card class="pa-2">
      <v-card-title class="font-display text-xl">{{ t('downloadTitle') }}</v-card-title>
      <v-card-text>
        <p class="text-muted mb-4">{{ t('downloadHint') }}</p>
        <v-btn-toggle
          v-model="picked"
          mandatory
          color="primary"
          variant="outlined"
          divided
          class="w-100"
        >
          <v-btn value="fr" class="flex-grow-1">{{ t('french') }}</v-btn>
          <v-btn value="en" class="flex-grow-1">{{ t('english') }}</v-btn>
        </v-btn-toggle>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" :loading="loading" prepend-icon="mdi-download" @click="confirm">
          {{ t('download') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { resolveLocale, type CvLocale } from '~/utils/cv-templates'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [locale: CvLocale]
}>()

const { t } = useUiI18n()
const { resume } = useResume()
const picked = ref<CvLocale>('fr')

watch(
  () => props.modelValue,
  (open) => {
    if (open) picked.value = resolveLocale(resume.value?.locale)
  },
)

function confirm() {
  emit('confirm', picked.value)
}
</script>

<script setup lang="ts">
import { useLocale } from 'vuetify'

const { current } = useLocale()
const { locale } = useUiI18n()

watch(
  locale,
  (value) => {
    current.value = value
  },
  { immediate: true },
)
</script>

<template>
  <span hidden />
</template>

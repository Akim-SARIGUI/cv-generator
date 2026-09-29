import { useLocale } from 'vuetify'

export default defineNuxtPlugin(() => {
  const { current } = useLocale()
  const { locale } = useUiI18n()

  watch(
    locale,
    (value) => {
      current.value = value
    },
    { immediate: true },
  )
})

import { en, fr } from 'vuetify/locale'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  modules: ['vuetify-nuxt-module', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
    },
  },
  vuetify: {
    moduleOptions: {
      styles: { configFile: 'assets/css/settings.scss' },
      disableVuetifyStyles: false,
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'cvLight',
        themes: {
          cvLight: {
            dark: false,
            colors: {
              primary: '#1e3a5f',
              secondary: '#0f766e',
              accent: '#c2410c',
              background: '#f4f6f8',
              surface: '#ffffff',
              error: '#b91c1c',
              info: '#0369a1',
              success: '#15803d',
              warning: '#b45309',
            },
          },
        },
      },
      locale: {
        locale: 'fr',
        fallback: 'fr',
        messages: { fr, en },
      },
      defaults: {
        VBtn: { rounded: 'lg', elevation: 0 },
        VCard: { rounded: 'lg', elevation: 0 },
        VTextField: { variant: 'outlined', density: 'comfortable' },
        VSelect: { variant: 'outlined', density: 'comfortable' },
        VTextarea: { variant: 'outlined', density: 'comfortable' },
      },
    },
  },
  app: {
    head: {
      title: 'CV Studio',
      meta: [
        {
          name: 'description',
          content: 'Créez et exportez un CV professionnel en quelques minutes.',
        },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap',
        },
      ],
    },
  },
})

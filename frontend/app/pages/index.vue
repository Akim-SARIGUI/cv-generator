<template>
  <div class="page-shell">
    <section class="grid gap-10 lg:grid-cols-2 lg:items-center min-h-[70vh]">
      <div class="space-y-6">
        <p class="text-sm uppercase tracking-[0.2em] text-accent font-semibold">
          {{ t('homeEyebrow') }}
        </p>
        <h1 class="font-display text-4xl md:text-5xl leading-tight text-ink">
          {{ t('homeTitle') }}
        </h1>
        <p class="text-lg text-muted max-w-xl">
          {{ t('homeSubtitle') }}
        </p>
        <div class="flex flex-wrap gap-3">
          <v-btn
            color="primary"
            size="large"
            :to="isAuthenticated ? '/editor' : '/auth/register'"
          >
            {{ isAuthenticated ? t('homeCtaContinue') : t('homeCtaStart') }}
          </v-btn>
          <v-btn
            v-if="!isAuthenticated"
            variant="outlined"
            color="primary"
            size="large"
            to="/auth/login"
          >
            {{ t('homeLogin') }}
          </v-btn>
        </div>
      </div>

      <div class="cv-paper rounded-2xl p-8 md:p-10 relative overflow-hidden">
        <div class="absolute inset-x-0 top-0 h-1.5 bg-accent" />
        <p class="font-display text-2xl text-ink mb-1">Alex Martin</p>
        <p class="text-sm text-muted mb-6">
          {{ locale === 'en' ? 'Full-stack developer · Paris' : 'Développeur fullstack · Paris' }}
        </p>
        <div class="space-y-4 text-sm">
          <div>
            <p class="font-semibold text-primary mb-1">
              {{ locale === 'en' ? 'Profile' : 'Profil' }}
            </p>
            <p class="text-muted">
              {{
                locale === 'en'
                  ? 'Building robust web apps with polished UX and steady delivery.'
                  : 'Conception d’applications web robustes, UX soignée et livraisons régulières.'
              }}
            </p>
          </div>
          <div>
            <p class="font-semibold text-primary mb-1">
              {{ locale === 'en' ? 'Experience' : 'Expérience' }}
            </p>
            <p class="font-medium">
              {{ locale === 'en' ? 'Software engineer — NovaTech' : 'Ingénieur logiciel — NovaTech' }}
            </p>
            <p class="text-muted">
              {{ locale === 'en' ? '2022 — Present' : '2022 — Aujourd’hui' }}
            </p>
          </div>
          <div>
            <p class="font-semibold text-primary mb-1">
              {{ locale === 'en' ? 'Skills' : 'Compétences' }}
            </p>
            <p class="text-muted">TypeScript · NestJS · Nuxt · PostgreSQL · Prisma</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-16 grid gap-6 md:grid-cols-3">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="rounded-2xl border border-[var(--cv-line)] bg-white/80 p-6"
      >
        <v-icon :icon="feature.icon" color="primary" class="mb-3" />
        <h2 class="font-display text-xl mb-2">{{ feature.title }}</h2>
        <p class="text-muted text-sm">{{ feature.text }}</p>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated } = useAuth()
const { t, locale } = useUiI18n()

const features = computed(() => [
  {
    icon: 'mdi-pencil-outline',
    title: t('homeFeatEditTitle'),
    text: t('homeFeatEditText'),
  },
  {
    icon: 'mdi-eye-outline',
    title: t('homeFeatPreviewTitle'),
    text: t('homeFeatPreviewText'),
  },
  {
    icon: 'mdi-file-pdf-box',
    title: t('homeFeatPdfTitle'),
    text: t('homeFeatPdfText'),
  },
])
</script>

<template>
  <article class="cv-paper rounded-2xl p-8 md:p-10 max-w-[800px] mx-auto">
    <header class="text-center mb-6">
      <h1 class="font-display text-3xl text-ink mb-2">
        {{ personal?.fullName || 'Votre nom' }}
      </h1>
      <p class="text-sm text-muted">{{ contactLine }}</p>
      <p v-if="links" class="text-sm text-accent mt-1">{{ links }}</p>
    </header>

    <section v-if="personal?.summary" class="mb-6">
      <h2 class="section-title">Profil professionnel</h2>
      <p class="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">{{ personal.summary }}</p>
    </section>

    <section v-if="experiences.length" class="mb-6">
      <h2 class="section-title">Expériences</h2>
      <div v-for="item in experiences" :key="item.id" class="mb-4">
        <div class="flex flex-wrap justify-between gap-2">
          <p class="font-semibold">
            {{ item.jobTitle }}
            <span class="font-normal text-muted"> — {{ item.company }}</span>
          </p>
          <p class="text-xs text-muted">
            {{ formatPeriod(item.startDate, item.endDate, item.currentJob) }}
          </p>
        </div>
        <p v-if="item.location" class="text-xs text-muted mb-1">{{ item.location }}</p>
        <p v-if="item.description" class="text-sm whitespace-pre-wrap">{{ item.description }}</p>
      </div>
    </section>

    <section v-if="educations.length" class="mb-6">
      <h2 class="section-title">Formations</h2>
      <div v-for="item in educations" :key="item.id" class="mb-4">
        <div class="flex flex-wrap justify-between gap-2">
          <p class="font-semibold">
            {{ item.degree }}
            <span class="font-normal text-muted"> — {{ item.institution }}</span>
          </p>
          <p class="text-xs text-muted">
            {{ formatPeriod(item.startDate, item.endDate, item.currentEducation) }}
          </p>
        </div>
        <p v-if="item.description" class="text-sm whitespace-pre-wrap">{{ item.description }}</p>
      </div>
    </section>

    <section v-if="skills.length">
      <h2 class="section-title">Compétences</h2>
      <div v-for="group in skillGroups" :key="group.label" class="mb-3">
        <p class="text-sm font-semibold mb-1">{{ group.label }}</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in group.items"
            :key="skill.id"
            class="text-xs px-2.5 py-1 rounded-md bg-[var(--cv-paper)] border border-[var(--cv-line)]"
          >
            {{ skill.name }}
            <span class="text-muted">({{ skill.proficiency }}/5)</span>
          </span>
        </div>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import type { Resume, SkillCategory } from '~/types/cv'

const props = defineProps<{ resume: Resume | null }>()

const personal = computed(() => props.resume?.personal)
const experiences = computed(() => props.resume?.experiences || [])
const educations = computed(() => props.resume?.educations || [])
const skills = computed(() => props.resume?.skills || [])

const contactLine = computed(() =>
  [personal.value?.email, personal.value?.phone, personal.value?.address]
    .filter(Boolean)
    .join(' · '),
)

const links = computed(() =>
  [personal.value?.linkedinUrl, personal.value?.githubUrl, personal.value?.websiteUrl]
    .filter(Boolean)
    .join(' · '),
)

const categoryLabels: Record<SkillCategory, string> = {
  TECHNICAL: 'Techniques',
  SOFT: 'Soft skills',
  LANGUAGE: 'Langues',
  TOOL: 'Outils',
  OTHER: 'Autres',
}

const skillGroups = computed(() => {
  const map = new Map<SkillCategory, typeof skills.value>()
  for (const skill of skills.value) {
    const list = map.get(skill.category) || []
    list.push(skill)
    map.set(skill.category, list)
  }
  return [...map.entries()].map(([category, items]) => ({
    label: categoryLabels[category],
    items,
  }))
})

function formatPeriod(
  start?: string | null,
  end?: string | null,
  current?: boolean,
) {
  const fmt = (value?: string | null) => {
    if (!value) return ''
    return new Date(value).toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric',
    })
  }
  const from = fmt(start) || '?'
  const to = current ? "Aujourd'hui" : fmt(end)
  return to ? `${from} – ${to}` : from
}
</script>

<style scoped>
.section-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.05rem;
  color: #1e3a5f;
  border-bottom: 1px solid var(--cv-line);
  padding-bottom: 0.35rem;
  margin-bottom: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>

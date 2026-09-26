<template>
  <div>
    <section v-if="showExperience && experiences.length" class="mb-6">
      <h2 :class="titleClass" :style="titleStyle">{{ labels.experience }}</h2>
      <div v-for="item in experiences" :key="item.id" class="mb-4">
        <div class="flex flex-wrap justify-between gap-2">
          <p class="font-semibold">
            {{ item.jobTitle }}
            <span v-if="!ats" class="font-normal text-muted"> — {{ item.company }}</span>
          </p>
          <p v-if="!ats" class="text-xs text-muted">
            {{ formatPeriod(item.startDate, item.endDate, item.currentJob) }}
          </p>
        </div>
        <p v-if="ats" class="text-sm text-muted mb-1">
          {{
            [item.company, formatPeriod(item.startDate, item.endDate, item.currentJob), item.location]
              .filter(Boolean)
              .join(' | ')
          }}
        </p>
        <p v-else-if="item.location" class="text-xs text-muted mb-1">{{ item.location }}</p>
        <p v-if="item.description" class="text-sm whitespace-pre-wrap">{{ item.description }}</p>
      </div>
    </section>

    <section v-if="showEducation && educations.length" class="mb-6">
      <h2 :class="titleClass" :style="titleStyle">{{ labels.education }}</h2>
      <div v-for="item in educations" :key="item.id" class="mb-4">
        <div class="flex flex-wrap justify-between gap-2">
          <p class="font-semibold">
            {{ item.degree }}
            <span v-if="!ats" class="font-normal text-muted"> — {{ item.institution }}</span>
          </p>
          <p v-if="!ats" class="text-xs text-muted">
            {{ formatPeriod(item.startDate, item.endDate, item.currentEducation) }}
          </p>
        </div>
        <p v-if="ats" class="text-sm text-muted mb-1">
          {{
            [
              item.institution,
              formatPeriod(item.startDate, item.endDate, item.currentEducation),
              item.location,
            ]
              .filter(Boolean)
              .join(' | ')
          }}
        </p>
        <p v-if="item.description" class="text-sm whitespace-pre-wrap">{{ item.description }}</p>
      </div>
    </section>

    <section v-if="!hideSkills && showSkills && skills.length">
      <h2 :class="titleClass" :style="titleStyle">{{ labels.skills }}</h2>
      <template v-if="minimal || ats">
        <p class="text-sm">
          {{ skills.map((s) => s.name).join(ats ? ', ' : '   ·   ') }}
        </p>
      </template>
      <template v-else>
        <div v-for="group in skillGroups" :key="group.label" class="mb-3">
          <p class="text-sm font-semibold mb-1">{{ group.label }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in group.items"
              :key="skill.id"
              class="text-xs px-2.5 py-1 rounded-md bg-[var(--cv-paper)] border border-[var(--cv-line)]"
            >
              {{ skill.name }}
            </span>
          </div>
        </div>
      </template>
    </section>

    <section
      v-for="group in extraGroups"
      :key="group.key"
      class="mb-6 mt-6"
    >
      <h2 :class="titleClass" :style="titleStyle">{{ group.title }}</h2>
      <div v-if="group.key === 'languages'" class="space-y-2">
        <div v-for="item in group.items" :key="item.id" class="d-flex justify-space-between gap-2">
          <p class="font-semibold text-sm">{{ item.title }}</p>
          <p class="text-sm text-muted">{{ item.subtitle }}</p>
        </div>
      </div>
      <p v-else-if="group.key === 'interests'" class="text-sm">
        {{ group.items.map((i) => i.title).join('  ·  ') }}
      </p>
      <div v-else>
        <div v-for="item in group.items" :key="item.id" class="mb-3">
          <p class="font-semibold text-sm">{{ item.title }}</p>
          <p class="text-xs text-muted">
            {{ [item.subtitle, item.dateLabel].filter(Boolean).join(' · ') }}
          </p>
          <p v-if="item.description" class="text-sm whitespace-pre-wrap">{{ item.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Resume, SkillCategory } from '~/types/cv'
import type { CvLabels, CvLocale } from '~/utils/cv-templates'
import { normalizeSections } from '~/utils/sections'

const props = withDefaults(
  defineProps<{
    resume: Resume | null
    labels: CvLabels
    accent: string
    locale: CvLocale
    ats?: boolean
    minimal?: boolean
    hideSkills?: boolean
  }>(),
  {
    ats: false,
    minimal: false,
    hideSkills: false,
  },
)

const sections = computed(() => normalizeSections(props.resume?.sections))
const showExperience = computed(() => sections.value.experience)
const showEducation = computed(() => sections.value.education)
const showSkills = computed(() => sections.value.skills)

const experiences = computed(() => props.resume?.experiences || [])
const educations = computed(() => props.resume?.educations || [])
const skills = computed(() =>
  (props.resume?.skills || []).filter((s) => s.category !== 'LANGUAGE'),
)
const extras = computed(() => props.resume?.extras || [])

const titleClass = computed(() =>
  props.ats
    ? 'section-title-us'
    : props.minimal
      ? 'section-title-minimal'
      : 'section-title',
)

const titleStyle = computed(() =>
  props.ats || props.minimal ? undefined : { color: props.accent },
)

const categoryLabels = computed<Partial<Record<SkillCategory, string>>>(() => ({
  TECHNICAL: props.labels.technical,
  SOFT: props.labels.soft,
  TOOL: props.labels.tool,
  OTHER: props.labels.other,
}))

const skillGroups = computed(() => {
  const map = new Map<SkillCategory, typeof skills.value>()
  for (const skill of skills.value) {
    const list = map.get(skill.category) || []
    list.push(skill)
    map.set(skill.category, list)
  }
  return [...map.entries()].map(([category, items]) => ({
    label: categoryLabels.value[category] || category,
    items,
  }))
})

const extraGroups = computed(() => {
  const defs = [
    { key: 'languages' as const, kind: 'LANGUAGE', title: props.labels.languages },
    { key: 'certifications' as const, kind: 'CERTIFICATION', title: props.labels.certifications },
    { key: 'awards' as const, kind: 'AWARD', title: props.labels.awards },
    { key: 'projects' as const, kind: 'PROJECT', title: props.labels.projects },
    { key: 'interests' as const, kind: 'INTEREST', title: props.labels.interests },
    { key: 'references' as const, kind: 'REFERENCE', title: props.labels.references },
  ]
  return defs
    .filter((d) => sections.value[d.key])
    .map((d) => ({
      ...d,
      items: extras.value.filter((e) => e.kind === d.kind),
    }))
    .filter((d) => d.items.length)
})

function formatPeriod(
  start?: string | null,
  end?: string | null,
  current?: boolean,
) {
  const loc = props.locale === 'en' ? 'en-GB' : 'fr-FR'
  const fmt = (value?: string | null) => {
    if (!value) return ''
    return new Date(value).toLocaleDateString(loc, {
      month: 'short',
      year: 'numeric',
    })
  }
  const from = fmt(start) || '?'
  const to = current ? props.labels.today : fmt(end)
  return to ? `${from} – ${to}` : from
}
</script>

<style scoped>
.section-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.05rem;
  border-bottom: 1px solid var(--cv-line);
  padding-bottom: 0.35rem;
  margin-bottom: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.section-title-us {
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid #111;
  padding-bottom: 0.25rem;
  margin-bottom: 0.75rem;
  letter-spacing: 0.06em;
}
.section-title-minimal {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #6b7280;
  margin-bottom: 0.75rem;
}
</style>

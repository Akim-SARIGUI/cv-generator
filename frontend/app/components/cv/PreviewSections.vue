<template>
  <div>
    <section v-if="showExperience && experiences.length" class="mb-6">
      <h2 :class="titleClass" :style="titleStyle">{{ labels.experience }}</h2>
      <div v-for="item in experiences" :key="item.id" class="mb-4">
        <p class="text-sm leading-relaxed">
          <span v-if="experiencePeriod(item)" class="font-semibold">{{ experiencePeriod(item) }} : </span>
          <span class="font-semibold">{{ item.jobTitle }}</span>
          <span v-if="item.company" class="italic"> — {{ item.company }}</span>
          <span v-if="item.location" class="text-muted">, {{ item.location }}</span>
        </p>
        <ul v-if="lines(item.description).length" class="cv-bullets">
          <li v-for="(line, index) in lines(item.description)" :key="index">{{ line }}</li>
        </ul>
      </div>
    </section>

    <section v-if="showEducation && educations.length" class="mb-6">
      <h2 :class="titleClass" :style="titleStyle">{{ labels.education }}</h2>
      <div v-for="item in educations" :key="item.id" class="mb-3">
        <p class="text-sm leading-relaxed">
          <span v-if="educationPeriod(item)" class="font-semibold">{{ educationPeriod(item) }} : </span>
          <span class="font-semibold">{{ item.degree }}</span>
          <span v-if="item.institution" class="italic"> — {{ item.institution }}</span>
          <span v-if="item.location">, {{ item.location }}</span>
          <span v-if="mention(item.description)"> ({{ mention(item.description) }})</span>
        </p>
        <ul v-if="detailLines(item.description).length" class="cv-bullets">
          <li v-for="(line, index) in detailLines(item.description)" :key="index">{{ line }}</li>
        </ul>
      </div>
    </section>

    <section v-if="!hideSkills && showSkills && skills.length" class="mb-6">
      <h2 :class="titleClass" :style="titleStyle">{{ labels.skills }}</h2>
      <p v-for="group in skillGroups" :key="group.label" class="text-sm leading-relaxed mb-2">
        <span class="font-semibold">{{ group.label }} :</span>
        {{ group.items.map((skill) => skill.name).join(', ') }}.
      </p>
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
      <div v-else-if="group.key === 'projects'">
        <p v-for="item in group.items" :key="item.id" class="text-sm leading-relaxed mb-2">
          <span class="font-semibold">{{ item.title }} :</span>
          {{ [item.subtitle, item.description].filter(Boolean).join(' — ') }}
        </p>
      </div>
      <div v-else>
        <div v-for="item in group.items" :key="item.id" class="mb-3">
          <p class="text-sm leading-relaxed">
            <span v-if="item.dateLabel" class="font-semibold">{{ item.dateLabel }} : </span>
            <span class="font-semibold">{{ item.title }}</span>
            <span v-if="item.subtitle" class="italic"> — {{ item.subtitle }}</span>
          </p>
          <ul v-if="lines(item.description).length" class="cv-bullets">
            <li v-for="(line, index) in lines(item.description)" :key="index">{{ line }}</li>
          </ul>
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

function yearOf(value?: string | null) {
  if (!value) return ''
  const match = String(value).match(/^(\d{4})/)
  if (match) return match[1]
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return String(date.getFullYear())
}

function yearPeriod(
  start?: string | null,
  end?: string | null,
  current?: boolean,
  currentLabel?: string,
) {
  const from = yearOf(start)
  const to = current ? currentLabel || '' : yearOf(end)
  if (from && to) return `${from} – ${to}`
  return from || to
}

function experiencePeriod(item: { startDate?: string | null; endDate?: string | null; currentJob?: boolean }) {
  return yearPeriod(
    item.startDate,
    item.endDate,
    item.currentJob,
    props.locale === 'en' ? 'Present' : 'Présent',
  )
}

function educationPeriod(item: {
  startDate?: string | null
  endDate?: string | null
  currentEducation?: boolean
}) {
  return yearPeriod(
    item.startDate,
    item.endDate,
    item.currentEducation,
    props.locale === 'en' ? 'Ongoing' : 'En cours',
  )
}

function lines(value?: string | null) {
  return (value || '')
    .split(/\n+/)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
}

function mention(value?: string | null) {
  const parts = lines(value)
  if (parts.length === 1 && parts[0].length <= 80) return parts[0]
  return ''
}

function detailLines(value?: string | null) {
  return mention(value) ? [] : lines(value)
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
.cv-bullets {
  margin: 0.25rem 0 0 1.1rem;
  padding: 0;
  list-style: disc;
}
.cv-bullets li {
  font-size: 0.875rem;
  line-height: 1.45;
}
</style>

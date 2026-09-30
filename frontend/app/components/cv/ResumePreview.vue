<template>
  <article
    class="cv-paper max-w-[800px] mx-auto overflow-hidden"
    :class="[`layout-${layout}`]"
  >
    <!-- Classic -->
    <div v-if="layout === 'classic'" class="p-8 md:p-10">
      <header class="d-flex gap-4 mb-6">
        <div class="flex-grow-1">
          <h1 class="font-display text-3xl mb-2" :style="{ color: accent }">
            {{ personal?.fullName || placeholderName }}
          </h1>
          <p class="text-sm text-muted">{{ contactLine }}</p>
          <p v-if="links" class="text-sm mt-1 break-all" :style="{ color: accent }">{{ links }}</p>
        </div>
        <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-eu" />
      </header>
      <CvPreviewSections :resume="resume" :labels="labels" :accent="accent" :locale="locale" />
    </div>

    <!-- ATS -->
    <div v-else-if="layout === 'ats'" class="p-8 md:p-10">
      <header class="text-center mb-6">
        <h1 class="text-2xl font-bold tracking-tight mb-2">
          {{ personal?.fullName || placeholderName }}
        </h1>
        <p class="text-sm text-muted">{{ contactLineAts }}</p>
      </header>
      <CvPreviewSections
        :resume="resume"
        :labels="labels"
        :accent="accent"
        :locale="locale"
        ats
      />
    </div>

    <!-- Sidebar -->
    <div v-else-if="layout === 'sidebar'" class="d-flex min-h-[640px]">
      <aside class="sidebar-pane text-white p-5" :style="{ background: accent }">
        <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-round mb-4" />
        <p class="text-xs uppercase tracking-wider opacity-80 mb-2">{{ labels.contact }}</p>
        <ul class="text-xs space-y-2 opacity-95 mb-6">
          <li v-for="line in contactList" :key="line">{{ line }}</li>
        </ul>
        <template v-if="skillGroups.length">
          <p class="text-xs uppercase tracking-wider opacity-80 mb-2">{{ labels.skills }}</p>
          <p v-for="group in skillGroups" :key="group.label" class="text-xs leading-relaxed mb-2 opacity-95">
            <span class="font-semibold">{{ group.label }} :</span>
            {{ group.items.map((skill) => skill.name).join(', ') }}.
          </p>
        </template>
      </aside>
      <div class="flex-grow-1 p-6 md:p-8">
        <h1 class="font-display text-3xl mb-4" :style="{ color: accent }">
          {{ personal?.fullName || placeholderName }}
        </h1>
        <CvPreviewSections
          :resume="resume"
          :labels="labels"
          :accent="accent"
          :locale="locale"
          hide-skills
        />
      </div>
    </div>

    <!-- Banner -->
    <div v-else-if="layout === 'banner'">
      <div class="banner-head text-white px-8 py-6 d-flex gap-4 align-center" :style="{ background: accent }">
        <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-banner" />
        <div>
          <h1 class="font-display text-3xl mb-2">{{ personal?.fullName || placeholderName }}</h1>
          <p class="text-sm opacity-90">{{ contactLine }}</p>
        </div>
      </div>
      <div class="p-8 md:p-10">
        <CvPreviewSections :resume="resume" :labels="labels" :accent="accent" :locale="locale" />
      </div>
    </div>

    <!-- Executive -->
    <div v-else-if="layout === 'executive'" class="p-8 md:p-10">
      <header class="d-flex gap-4 mb-2">
        <div class="flex-grow-1">
          <h1 class="text-3xl font-bold mb-2" :style="{ color: accent }">
            {{ personal?.fullName || placeholderName }}
          </h1>
          <div class="accent-bar mb-3" :style="{ background: accent }" />
          <p class="text-sm text-muted">{{ contactLine }}</p>
        </div>
        <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-eu" />
      </header>
      <CvPreviewSections :resume="resume" :labels="labels" :accent="accent" :locale="locale" />
    </div>

    <!-- Timeline -->
    <div v-else-if="layout === 'timeline'" class="p-8 md:p-10">
      <header class="d-flex gap-4 mb-6">
        <div class="flex-grow-1">
          <h1 class="font-display text-3xl mb-2" :style="{ color: accent }">
            {{ personal?.fullName || placeholderName }}
          </h1>
          <p class="text-sm text-muted">{{ contactLine }}</p>
        </div>
        <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-eu" />
      </header>
      <CvPreviewSections
        :resume="resume"
        :labels="labels"
        :accent="accent"
        :locale="locale"
        timeline
      />
    </div>

    <!-- Two columns -->
    <div v-else-if="layout === 'twocol'" class="p-8 md:p-10">
      <h1 class="font-display text-3xl mb-3" :style="{ color: accent }">
        {{ personal?.fullName || placeholderName }}
      </h1>
      <div class="accent-line mb-5" :style="{ background: accent }" />
      <div class="d-flex flex-wrap gap-6">
        <aside class="twocol-side">
          <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-eu mb-4" />
          <p class="text-xs font-bold uppercase mb-2" :style="{ color: accent }">{{ labels.contact }}</p>
          <ul class="text-xs text-muted space-y-1 mb-4">
            <li v-for="line in contactList" :key="line">{{ line }}</li>
          </ul>
          <p class="text-xs font-bold uppercase mb-2" :style="{ color: accent }">{{ labels.skills }}</p>
          <p v-for="group in skillGroups" :key="group.label" class="text-xs leading-relaxed mb-2">
            <span class="font-semibold">{{ group.label }} :</span>
            {{ group.items.map((skill) => skill.name).join(', ') }}.
          </p>
        </aside>
        <div class="flex-grow-1" style="min-width: 240px">
          <CvPreviewSections
            :resume="resume"
            :labels="labels"
            :accent="accent"
            :locale="locale"
            hide-skills
          />
        </div>
      </div>
    </div>

    <!-- Elegant -->
    <div v-else-if="layout === 'elegant'" class="p-8 md:p-12 text-center">
      <h1 class="elegant-name mb-3" :style="{ color: accent }">
        {{ personal?.fullName || placeholderName }}
      </h1>
      <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-eu mx-auto mb-4" />
      <p class="text-sm text-muted mb-6">{{ contactLine }}</p>
      <div class="text-left">
        <CvPreviewSections :resume="resume" :labels="labels" :accent="accent" :locale="locale" minimal />
      </div>
    </div>

    <!-- Minimal (default fallback) -->
    <div v-else class="p-8 md:p-12 relative">
      <img v-if="photoSrc" :src="photoSrc" alt="Photo" class="photo-minimal" />
      <h1 class="text-4xl font-semibold tracking-tight mb-2 pr-20" :style="{ color: accent }">
        {{ personal?.fullName || placeholderName }}
      </h1>
      <p class="text-sm text-muted mb-8 max-w-[85%]">{{ contactLine }}</p>
      <CvPreviewSections
        :resume="resume"
        :labels="labels"
        :accent="accent"
        :locale="locale"
        minimal
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Resume, SkillCategory } from '~/types/cv'
import {
  getLabels,
  getTemplateMeta,
  resolveLocale,
} from '~/utils/cv-templates'

const props = defineProps<{ resume: Resume | null }>()
const { mediaUrl } = useMediaUrl()

const personal = computed(() => props.resume?.personal)
const skills = computed(() =>
  (props.resume?.skills || []).filter((s) => s.category !== 'LANGUAGE'),
)
const skillGroups = computed(() => {
  const names: Partial<Record<SkillCategory, string>> = {
    TECHNICAL: labels.value.technical,
    SOFT: labels.value.soft,
    TOOL: labels.value.tool,
    OTHER: labels.value.other,
  }
  const map = new Map<string, typeof skills.value>()
  for (const skill of skills.value) {
    const label = names[skill.category] || skill.category
    const list = map.get(label) || []
    list.push(skill)
    map.set(label, list)
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }))
})
const { templates, loadTemplates } = useTemplates()
onMounted(() => {
  loadTemplates()
})
const meta = computed(() => getTemplateMeta(props.resume?.template, templates.value))
const layout = computed(() => meta.value.layout)
const accent = computed(() => meta.value.accent)
const locale = computed(() => resolveLocale(props.resume?.locale))
const labels = computed(() => getLabels(locale.value))
const placeholderName = computed(() =>
  locale.value === 'en' ? 'Your name' : 'Votre nom',
)
const photoSrc = computed(() => {
  if (!meta.value.showsPhoto) return ''
  return mediaUrl(personal.value?.photoUrl)
})

const contactLine = computed(() =>
  [personal.value?.email, personal.value?.phone, personal.value?.address]
    .filter(Boolean)
    .join(' · '),
)
const contactLineAts = computed(() =>
  [
    personal.value?.email,
    personal.value?.phone,
    personal.value?.address,
    personal.value?.linkedinUrl,
    personal.value?.githubUrl,
    personal.value?.websiteUrl,
  ]
    .filter(Boolean)
    .join(' | '),
)
const links = computed(() =>
  [personal.value?.linkedinUrl, personal.value?.githubUrl, personal.value?.websiteUrl]
    .filter(Boolean)
    .join(' · '),
)
const contactList = computed(
  () =>
    [
      personal.value?.email,
      personal.value?.phone,
      personal.value?.address,
      personal.value?.linkedinUrl,
      personal.value?.githubUrl,
      personal.value?.websiteUrl,
    ].filter(Boolean) as string[],
)
</script>

<style scoped>
.section-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.02rem;
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: 0;
  text-transform: none;
  border-bottom: 2px solid currentColor;
  padding-bottom: 0.2rem;
  margin: 0 0 0.8rem;
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
.photo-eu {
  width: 105px;
  height: 135px;
  object-fit: cover;
  object-position: center top;
  border-radius: 4px;
  border: 1px solid var(--cv-line);
  flex-shrink: 0;
}
.photo-round {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.35);
  display: block;
  margin-inline: auto;
}
.photo-banner {
  width: 78px;
  height: 78px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.photo-minimal {
  position: absolute;
  top: 2.5rem;
  right: 2.5rem;
  width: 72px;
  height: 90px;
  object-fit: cover;
  border-radius: 2px;
}
.sidebar-pane {
  width: 220px;
  flex-shrink: 0;
}
.accent-bar {
  width: 120px;
  height: 3px;
  border-radius: 2px;
}
.accent-line {
  height: 2px;
  width: 100%;
}
.twocol-side {
  width: 200px;
  flex-shrink: 0;
}
.timeline-item {
  border-left: 2px solid var(--cv-line);
  padding-left: 1rem;
  margin-left: 0.25rem;
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
.elegant-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.2rem;
  font-weight: 700;
}
@media (max-width: 700px) {
  .sidebar-pane,
  .twocol-side {
    width: 100%;
  }
  .photo-minimal {
    position: static;
    margin-bottom: 1rem;
  }
}
</style>

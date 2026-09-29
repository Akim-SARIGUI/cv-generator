<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex flex-wrap align-center justify-space-between gap-3 mb-4">
      <div>
        <h2 class="font-display text-xl">{{ t('tabSkills') }}</h2>
        <p class="text-sm text-muted">{{ t('hintSkills') }}</p>
      </div>
    </div>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mb-3" density="compact">
      {{ errorMsg }}
    </v-alert>

    <div class="skill-add mb-5">
      <v-row dense align="center">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="draftName"
            :label="t('labelSkill')"
            placeholder="Ex. Vue.js, Docker, Leadership…"
            hide-details="auto"
            @keyup.enter="addOne"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="draftCategory"
            :items="categories"
            item-title="title"
            item-value="value"
            :label="t('labelCategory')"
            hide-details="auto"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-btn color="primary" block :loading="busy" prepend-icon="mdi-plus" @click="addOne">
            {{ t('btnAdd') }}
          </v-btn>
        </v-col>
      </v-row>
      <p class="text-xs text-muted mt-2">
        {{ t('infoSkillHint') }}
      </p>
    </div>

    <div v-if="!visibleSkills.length" class="text-muted text-sm">
      {{ t('emptySkills') }}
    </div>

    <div v-for="group in grouped" :key="group.value" class="mb-5">
      <p class="text-sm font-semibold mb-2" :style="{ color: 'var(--cv-ink)' }">
        {{ group.title }}
      </p>
      <div class="d-flex flex-wrap gap-2">
        <v-chip
          v-for="skill in group.items"
          :key="skill.id"
          closable
          color="primary"
          variant="tonal"
          @click:close="removeItem(skill.id)"
        >
          {{ skill.name }}
        </v-chip>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { Skill, SkillCategory } from '~/types/cv'

const { t, te } = useUiI18n()
const { resume, addSkill, removeSkill } = useResume()

const busy = ref(false)
const errorMsg = ref('')
const draftName = ref('')
const draftCategory = ref<SkillCategory>('TECHNICAL')

const categories = computed(() => [
  { title: t('skillCatTechnical'), value: 'TECHNICAL' as const },
  { title: t('skillCatTool'), value: 'TOOL' as const },
  { title: t('skillCatSoft'), value: 'SOFT' as const },
  { title: t('skillCatOther'), value: 'OTHER' as const },
])

const visibleSkills = computed(() =>
  (resume.value?.skills || []).filter((s) => s.category !== 'LANGUAGE'),
)

const grouped = computed(() =>
  categories.value
    .map((cat) => ({
      ...cat,
      items: visibleSkills.value.filter((s) => s.category === cat.value),
    }))
    .filter((g) => g.items.length),
)

async function addOne() {
  errorMsg.value = ''
  const name = draftName.value.trim()
  if (!name) {
    errorMsg.value = t('infoSkillRequired')
    return
  }
  const exists = visibleSkills.value.some(
    (s) => s.name.toLowerCase() === name.toLowerCase() && s.category === draftCategory.value,
  )
  if (exists) {
    errorMsg.value = t('infoSkillDuplicate')
    return
  }
  busy.value = true
  try {
    await addSkill({
      name,
      category: draftCategory.value,
      proficiency: 3,
    })
    draftName.value = ''
  } catch (e: unknown) {
    errorMsg.value = te(e, 'infoAddFailed')
  } finally {
    busy.value = false
  }
}

async function removeItem(id: string) {
  await removeSkill(id)
}
</script>

<style scoped>
.skill-add {
  border: 1px solid var(--cv-line);
  border-radius: 12px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
}
</style>

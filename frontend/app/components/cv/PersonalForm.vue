<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="font-display text-xl">{{ t('tabProfile') }}</h2>
      <v-btn color="primary" :loading="saving" @click="save">{{ t('btnSave') }}</v-btn>
    </div>

    <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" density="comfortable">
      {{ message }}
    </v-alert>

    <div class="d-flex flex-wrap gap-5 mb-5">
      <div class="photo-box">
        <div class="photo-frame" :class="{ 'photo-frame--empty': !photoPreview }">
          <img v-if="photoPreview" :src="photoPreview" alt="Photo CV" class="photo-img" />
          <span v-else class="text-xs text-muted text-center px-2">{{ t('infoPhotoPortrait') }}<br />35×45</span>
        </div>
        <div class="d-flex flex-column gap-2 mt-3" style="min-width: 140px">
          <v-btn
            size="small"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-camera"
            :loading="uploading"
            @click="fileInput?.click()"
          >
            {{ t('btnAdd') }}
          </v-btn>
          <v-btn
            v-if="resume?.personal?.photoUrl"
            size="small"
            variant="text"
            color="error"
            :loading="uploading"
            @click="onRemovePhoto"
          >
            {{ t('btnRemove') }}
          </v-btn>
          <p class="text-[11px] text-muted">{{ t('infoPhotoHint') }}</p>
          <p v-if="!showsPhoto" class="text-[11px] text-accent">
            {{ t('infoPhotoHidden') }}
          </p>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="d-none"
          @change="onFile"
        />
      </div>
    </div>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.fullName" label="Nom complet *" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.email" label="Email" type="email" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.phone" label="Téléphone" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.address" label="Adresse / Ville" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.linkedinUrl" label="LinkedIn" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.githubUrl" label="GitHub" />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.websiteUrl" label="Site web" />
      </v-col>
      <v-col cols="12">
        <v-textarea v-model="form.summary" label="Profil / résumé professionnel" rows="4" auto-grow />
      </v-col>
      <v-col cols="12">
        <v-textarea
          v-model="form.objective"
          label="Objectif de carrière (optionnel)"
          rows="3"
          auto-grow
          hint="Activez la section « Objectif » dans Structure pour l’afficher"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { getTemplateMeta } from '~/utils/cv-templates'

const { t } = useUiI18n()
const { resume, savePersonal, uploadPhoto, removePhoto, saving } = useResume()
const { mediaUrl } = useMediaUrl()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  linkedinUrl: '',
  githubUrl: '',
  websiteUrl: '',
  summary: '',
  objective: '',
})

const messageKey = ref<'infoProfileSaved' | 'infoSaveFailed' | 'infoPhotoSaved' | 'infoPhotoFailed' | 'infoPhotoRemoved' | 'infoPhotoRemoveFailed' | ''>('')
const messageType = ref<'success' | 'error'>('success')
const message = computed(() => (messageKey.value ? t(messageKey.value) : ''))
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const photoPreview = computed(() => mediaUrl(resume.value?.personal?.photoUrl))
const showsPhoto = computed(() => getTemplateMeta(resume.value?.template).showsPhoto)

watch(
  () => resume.value?.personal,
  (personal) => {
    if (!personal) return
    form.fullName = personal.fullName || ''
    form.email = personal.email || ''
    form.phone = personal.phone || ''
    form.address = personal.address || ''
    form.linkedinUrl = personal.linkedinUrl || ''
    form.githubUrl = personal.githubUrl || ''
    form.websiteUrl = personal.websiteUrl || ''
    form.summary = personal.summary || ''
    form.objective = personal.objective || ''
  },
  { immediate: true },
)

async function save() {
  messageKey.value = ''
  try {
    await savePersonal({ ...form })
    messageType.value = 'success'
    messageKey.value = 'infoProfileSaved'
  } catch {
    messageType.value = 'error'
    messageKey.value = 'infoSaveFailed'
  }
}

async function onFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  uploading.value = true
  messageKey.value = ''
  try {
    await uploadPhoto(file)
    messageType.value = 'success'
    messageKey.value = 'infoPhotoSaved'
  } catch {
    messageType.value = 'error'
    messageKey.value = 'infoPhotoFailed'
  } finally {
    uploading.value = false
  }
}

async function onRemovePhoto() {
  uploading.value = true
  try {
    await removePhoto()
    messageType.value = 'success'
    messageKey.value = 'infoPhotoRemoved'
  } catch {
    messageType.value = 'error'
    messageKey.value = 'infoPhotoRemoveFailed'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.photo-box {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.photo-frame {
  width: 105px;
  height: 135px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--cv-line);
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.photo-frame--empty {
  border-style: dashed;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}
</style>

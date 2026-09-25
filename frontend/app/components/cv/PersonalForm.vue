<template>
  <v-card border class="pa-4 md:pa-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="font-display text-xl">Informations personnelles</h2>
      <v-btn color="primary" :loading="saving" @click="save">Enregistrer</v-btn>
    </div>

    <v-alert v-if="message" :type="messageType" variant="tonal" class="mb-4" density="comfortable">
      {{ message }}
    </v-alert>

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
        <v-textarea v-model="form.summary" label="Résumé professionnel" rows="4" auto-grow />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
const { resume, savePersonal, saving } = useResume()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  linkedinUrl: '',
  githubUrl: '',
  websiteUrl: '',
  summary: '',
})

const message = ref('')
const messageType = ref<'success' | 'error'>('success')

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
  },
  { immediate: true },
)

async function save() {
  message.value = ''
  try {
    await savePersonal({ ...form })
    messageType.value = 'success'
    message.value = 'Profil enregistré'
  } catch {
    messageType.value = 'error'
    message.value = 'Échec de l’enregistrement'
  }
}
</script>

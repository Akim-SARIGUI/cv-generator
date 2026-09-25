<template>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-text-field v-model="model.jobTitle" label="Poste *" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="model.company" label="Entreprise *" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="model.location" label="Lieu" />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field v-model="model.startDate" label="Début" type="date" />
    </v-col>
    <v-col cols="12" md="3">
      <v-text-field
        v-model="model.endDate"
        label="Fin"
        type="date"
        :disabled="model.currentJob"
      />
    </v-col>
    <v-col cols="12">
      <v-checkbox v-model="model.currentJob" label="Poste actuel" hide-details />
    </v-col>
    <v-col cols="12">
      <v-textarea v-model="model.description" label="Description" rows="3" auto-grow />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Experience } from '~/types/cv'

const model = defineModel<Partial<Experience>>({ required: true })
</script>

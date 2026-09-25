<template>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-text-field v-model="model.degree" label="Diplôme *" />
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="model.institution" label="Établissement *" />
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
        :disabled="model.currentEducation"
      />
    </v-col>
    <v-col cols="12">
      <v-checkbox v-model="model.currentEducation" label="En cours" hide-details />
    </v-col>
    <v-col cols="12">
      <v-textarea v-model="model.description" label="Description" rows="3" auto-grow />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Education } from '~/types/cv'

const model = defineModel<Partial<Education>>({ required: true })
</script>

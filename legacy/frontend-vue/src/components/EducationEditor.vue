<!-- frontend/src/components/EducationEditor.vue -->
<template>
  <div class="form-section">
    <h2>
      Formations
      <i class="fas fa-chevron-down toggle-icon" @click="toggleCollapse"></i>
    </h2>
    
    <div class="form-content" :class="{ collapsed: isCollapsed }">
      <div v-for="(education, index) in educations" :key="education.id || index" class="dynamic-item">
        <div class="form-row">
          <div class="form-group">
            <label>Diplôme *</label>
            <input type="text" v-model="education.degree" placeholder="Ex: Master en Informatique">
          </div>
          <div class="form-group">
            <label>Établissement *</label>
            <input type="text" v-model="education.institution" placeholder="Nom de l'établissement">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Lieu</label>
            <input type="text" v-model="education.location" placeholder="Ville, Pays">
          </div>
          <div class="form-group">
            <label>Date de début</label>
            <input type="month" v-model="education.start_date">
          </div>
          <div class="form-group">
            <label>Date de fin</label>
            <input type="month" v-model="education.end_date" :disabled="education.current_education">
          </div>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="education.current_education"> Formation en cours
          </label>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="education.description" placeholder="Décrivez votre formation..."></textarea>
        </div>
        
        <button @click="removeEducation(index)" class="btn-danger">
          <i class="fas fa-trash"></i> Supprimer
        </button>
        
        <hr v-if="index < educations.length - 1">
      </div>
      
      <button @click="addEducation" class="add-btn btn-secondary">
        <i class="fas fa-plus"></i> Ajouter une formation
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'EducationEditor',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const educations = ref([])
    const isCollapsed = ref(false)

    const addEducation = () => {
      educations.value.push({
        degree: '',
        institution: '',
        location: '',
        start_date: '',
        end_date: '',
        current_education: false,
        description: ''
      })
    }

    const removeEducation = (index) => {
      if (confirm('Voulez-vous vraiment supprimer cette formation?')) {
        educations.value.splice(index, 1)
      }
    }

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }

    // Charger les formations existantes (simulation)
    const loadEducations = () => {
      // En attendant le backend, on ajoute un exemple
      addEducation()
    }

    loadEducations()

    return {
      educations,
      isCollapsed,
      addEducation,
      removeEducation,
      toggleCollapse
    }
  }
}
</script>

<style scoped>
.collapsed {
  display: none;
}

.toggle-icon {
  cursor: pointer;
  font-size: 1.2rem;
}

.dynamic-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.add-btn {
  margin-top: 1rem;
}
</style>
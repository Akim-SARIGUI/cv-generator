<!-- frontend/src/components/ExperienceEditor.vue -->
<template>
  <div class="form-section">
    <h2>
      Expériences Professionnelles
      <i class="fas fa-chevron-down toggle-icon" @click="toggleCollapse"></i>
    </h2>
    
    <div class="form-content" :class="{ collapsed: isCollapsed }">
      <div v-for="(experience, index) in experiences" :key="experience.id || index" class="dynamic-item">
        <div class="form-row">
          <div class="form-group">
            <label>Poste *</label>
            <input type="text" v-model="experience.job_title" placeholder="Ex: Développeur Web">
          </div>
          <div class="form-group">
            <label>Entreprise *</label>
            <input type="text" v-model="experience.company" placeholder="Nom de l'entreprise">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Lieu</label>
            <input type="text" v-model="experience.location" placeholder="Ville, Pays">
          </div>
          <div class="form-group">
            <label>Date de début</label>
            <input type="month" v-model="experience.start_date">
          </div>
          <div class="form-group">
            <label>Date de fin</label>
            <input type="month" v-model="experience.end_date" :disabled="experience.current_job">
          </div>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="experience.current_job"> Poste actuel
          </label>
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="experience.description" placeholder="Décrivez vos responsabilités et réalisations..."></textarea>
        </div>
        
        <button @click="removeExperience(index)" class="btn-danger">
          <i class="fas fa-trash"></i> Supprimer
        </button>
        
        <hr v-if="index < experiences.length - 1">
      </div>
      
      <button @click="addExperience" class="add-btn btn-secondary">
        <i class="fas fa-plus"></i> Ajouter une expérience
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ExperienceEditor',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const experiences = ref([])
    const isCollapsed = ref(false)

    const addExperience = () => {
      experiences.value.push({
        job_title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        current_job: false,
        description: ''
      })
    }

    const removeExperience = (index) => {
      if (confirm('Voulez-vous vraiment supprimer cette expérience?')) {
        experiences.value.splice(index, 1)
      }
    }

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }

    // Charger les expériences existantes (simulation)
    const loadExperiences = () => {
      // En attendant le backend, on ajoute un exemple
      addExperience()
      experiences.value[0] = {
        job_title: 'Développeur Full-Stack',
        company: 'Tech Solutions Inc.',
        location: 'Paris, France',
        start_date: '2020-01',
        end_date: '',
        current_job: true,
        description: 'Développement et maintenance d\'applications web avec React, Node.js et MongoDB.'
      }
    }

    loadExperiences()

    return {
      experiences,
      isCollapsed,
      addExperience,
      removeExperience,
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
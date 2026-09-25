<!-- frontend/src/components/PersonalInfo.vue -->
<template>
  <div class="form-section">
    <h2>
      Informations Personnelles
      <i class="fas fa-chevron-down toggle-icon" @click="toggleCollapse"></i>
    </h2>
    
    <div class="form-content" :class="{ collapsed: isCollapsed }">
      <div class="form-row">
        <div class="form-group">
          <label for="fullName">Nom complet *</label>
          <input 
            type="text" 
            id="fullName" 
            v-model="personalInfo.full_name" 
            placeholder="Votre nom complet"
          >
        </div>
        <div class="form-group">
          <label for="email">Email *</label>
          <input 
            type="email" 
            id="email" 
            v-model="personalInfo.email" 
            placeholder="votre@email.com"
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="phone">Téléphone</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="personalInfo.phone" 
            placeholder="Votre numéro de téléphone"
          >
        </div>
        <div class="form-group">
          <label for="address">Adresse</label>
          <input 
            type="text" 
            id="address" 
            v-model="personalInfo.address" 
            placeholder="Ville, Pays"
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="linkedin">Profil LinkedIn</label>
          <input 
            type="url" 
            id="linkedin" 
            v-model="personalInfo.linkedin_url" 
            placeholder="URL de votre profil LinkedIn"
          >
        </div>
        <div class="form-group">
          <label for="github">Profil GitHub</label>
          <input 
            type="url" 
            id="github" 
            v-model="personalInfo.github_url" 
            placeholder="URL de votre profil GitHub"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label for="summary">Résumé professionnel</label>
        <textarea 
          id="summary" 
          v-model="personalInfo.summary" 
          placeholder="Un bref résumé de votre profil professionnel"
          rows="4"
        ></textarea>
      </div>
      
      <button @click="savePersonalInfo" class="btn-success">
        <i class="fas fa-save"></i> Enregistrer
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PersonalInfo',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const personalInfo = ref({
      full_name: '',
      email: '',
      phone: '',
      address: '',
      linkedin_url: '',
      github_url: '',
      summary: ''
    })
    
    const isCollapsed = ref(false)

    const savePersonalInfo = () => {
      alert('Informations personnelles enregistrées avec succès!')
    }

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }

    // Charger les informations existantes (simulation)
    const loadPersonalInfo = () => {
      personalInfo.value = {
        full_name: 'Jean Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33 6 12 34 56 78',
        address: 'Paris, France',
        linkedin_url: 'https://linkedin.com/in/jeandupont',
        github_url: 'https://github.com/jeandupont',
        summary: 'Développeur full-stack avec 5 ans d\'expérience dans la création d\'applications web modernes et évolutives.'
      }
    }

    loadPersonalInfo()

    return {
      personalInfo,
      isCollapsed,
      savePersonalInfo,
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
</style>
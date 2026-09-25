<!-- frontend/src/components/SkillsEditor.vue -->
<template>
  <div class="form-section">
    <h2>
      Compétences
      <i class="fas fa-chevron-down toggle-icon" @click="toggleCollapse"></i>
    </h2>
    
    <div class="form-content" :class="{ collapsed: isCollapsed }">
      <div class="form-group">
        <label>Compétences techniques (séparées par des virgules)</label>
        <textarea v-model="technicalSkills" placeholder="Ex: JavaScript, HTML5, CSS3, React, Node.js..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Langues</label>
        <div v-for="(language, index) in languages" :key="index" class="language-item">
          <div class="form-row">
            <div class="form-group">
              <input type="text" v-model="language.name" placeholder="Langue">
            </div>
            <div class="form-group">
              <select v-model="language.level">
                <option value="1">Débutant</option>
                <option value="2">Intermédiaire</option>
                <option value="3">Avancé</option>
                <option value="4">Courant</option>
                <option value="5">Natif</option>
              </select>
            </div>
            <button @click="removeLanguage(index)" class="btn-danger">
              <i class="fas fa-trash">Supprimer</i>
            </button>
          </div>
        </div>
        <button @click="addLanguage" class="btn-secondary">
          <i class="fas fa-plus"></i> Ajouter une langue
        </button>
      </div>
      
      <button @click="saveSkills" class="btn-success">
        <i class="fas fa-save"></i> Enregistrer les compétences
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'SkillsEditor',
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const technicalSkills = ref('')
    const languages = ref([])
    const isCollapsed = ref(false)

    const addLanguage = () => {
      languages.value.push({
        name: '',
        level: 3
      })
    }

    const removeLanguage = (index) => {
      languages.value.splice(index, 1)
    }

    const saveSkills = () => {
      alert('Compétences enregistrées avec succès!')
    }

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
    }

    // Charger les compétences existantes (simulation)
    const loadSkills = () => {
      technicalSkills.value = 'JavaScript, HTML5, CSS3, React, Node.js, Vue.js, PostgreSQL'
      addLanguage()
      languages.value[0] = { name: 'Anglais', level: 4 }
    }

    loadSkills()

    return {
      technicalSkills,
      languages,
      isCollapsed,
      addLanguage,
      removeLanguage,
      saveSkills,
      toggleCollapse
    }
  }
}
</script>

<style scoped>
.language-item {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>
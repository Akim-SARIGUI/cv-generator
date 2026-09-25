<!-- frontend/src/views/Editor.vue -->
<template>
  <div class="editor">
    <h2>Éditeur de CV</h2>
    <p>Remplissez les différentes sections pour créer votre CV personnalisé</p>

    <PersonalInfo :userId="userId" />
    <ExperienceEditor :userId="userId" />
    <EducationEditor :userId="userId" />
    <SkillsEditor :userId="userId" />

    <div class="action-buttons">
      <button @click="$router.push('/preview')" class="btn-primary">
        <i class="fas fa-eye"></i> Prévisualiser le CV
      </button>
      <button @click="saveAll" class="btn-success">
        <i class="fas fa-save"></i> Sauvegarder tout
      </button>
    </div>
  </div>
</template>

<script>
import PersonalInfo from '@/components/PersonalInfo.vue'
import ExperienceEditor from '@/components/ExperienceEditor.vue'
import EducationEditor from '@/components/EducationEditor.vue'
import SkillsEditor from '@/components/SkillsEditor.vue'

export default {
  name: 'EditorView',
  components: {
    PersonalInfo,
    ExperienceEditor,
    EducationEditor,
    SkillsEditor
  },
  data() {
    return {
      userId: 1 // En attendant l'authentification, on utilise un ID fixe
    }
  },
  methods: {
    saveAll() {
      // Cette méthode déclencherait la sauvegarde de tous les composants
      // Pour l'instant, on affiche simplement un message
      alert('Toutes les modifications ont été sauvegardées!')
    }
  }
}
</script>

<style scoped>
.editor {
  padding: 1rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>
<!-- frontend/src/views/Preview.vue -->
<template>
  <div class="preview">
    <div class="preview-header">
      <h2>Aperçu de votre CV</h2>
      <p>Vérifiez l'apparence de votre CV avant de le télécharger</p>
    </div>

    <div class="preview-actions">
      <button @click="generatePDF" class="btn-primary" :disabled="generatingPDF">
        <i class="fas fa-file-pdf"></i> 
        {{ generatingPDF ? 'Génération en cours...' : 'Télécharger le PDF' }}
      </button>
      <button @click="$router.push('/editor')" class="btn-secondary">
        <i class="fas fa-edit"></i> Modifier le CV
      </button>
    </div>

    <div class="cv-container">
      <div class="cv-template">
        <!-- En-tête avec informations personnelles -->
        <header class="cv-header">
          <h1>{{ personalInfo.full_name || 'Votre nom complet' }}</h1>
          <div class="contact-info">
            <p v-if="personalInfo.email">📧 {{ personalInfo.email }}</p>
            <p v-if="personalInfo.phone">📱 {{ personalInfo.phone }}</p>
            <p v-if="personalInfo.address">📍 {{ personalInfo.address }}</p>
            <p v-if="personalInfo.linkedin_url">
              🔗 <a :href="personalInfo.linkedin_url" target="_blank">LinkedIn</a>
            </p>
            <p v-if="personalInfo.github_url">
              💻 <a :href="personalInfo.github_url" target="_blank">GitHub</a>
            </p>
          </div>
        </header>
        
        <!-- Résumé professionnel -->
        <section v-if="personalInfo.summary" class="cv-section">
          <h2>Profil Professionnel</h2>
          <p>{{ personalInfo.summary }}</p>
        </section>
        
        <!-- Expériences professionnelles -->
        <section class="cv-section" v-if="experiences.length > 0">
          <h2>Expériences Professionnelles</h2>
          <div v-for="exp in experiences" :key="exp.id" class="experience-item">
            <h3>{{ exp.job_title }} - {{ exp.company }}</h3>
            <p class="date-location">
              {{ formatDate(exp.start_date) }} - {{ exp.current_job ? 'Présent' : formatDate(exp.end_date) }} | {{ exp.location }}
            </p>
            <p v-if="exp.description">{{ exp.description }}</p>
          </div>
        </section>
        
        <!-- Formations -->
        <section class="cv-section" v-if="educations.length > 0">
          <h2>Formation</h2>
          <div v-for="edu in educations" :key="edu.id" class="education-item">
            <h3>{{ edu.degree }} - {{ edu.institution }}</h3>
            <p class="date-location">
              {{ formatDate(edu.start_date) }} - {{ edu.current_education ? 'Présent' : formatDate(edu.end_date) }} | {{ edu.location }}
            </p>
            <p v-if="edu.description">{{ edu.description }}</p>
          </div>
        </section>
        
        <!-- Compétences -->
        <section class="cv-section" v-if="skills.length > 0">
          <h2>Compétences</h2>
          <div class="skills-container">
            <div v-for="skill in skills" :key="skill.id" class="skill-item">
              <span class="skill-name">{{ skill.skill_name }}</span>
              <div class="skill-level">
                <span v-for="n in 5" :key="n" class="dot" :class="{ filled: n <= skill.proficiency }"></span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'PreviewView',
  setup() {
    const personalInfo = ref({})
    const experiences = ref([])
    const educations = ref([])
    const skills = ref([])
    const generatingPDF = ref(false)

    const loadCVData = async () => {
      try {
        // Pour l'instant, on utilise des données simulées en attendant le backend
        personalInfo.value = {
          full_name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+33 6 12 34 56 78',
          address: 'Paris, France',
          linkedin_url: 'https://linkedin.com/in/jeandupont',
          github_url: 'https://github.com/jeandupont',
          summary: 'Développeur full-stack avec 5 ans d\'expérience dans la création d\'applications web modernes et évolutives. Passionné par les technologies JavaScript et les bonnes pratiques de développement.'
        }

        experiences.value = [
          {
            id: 1,
            job_title: 'Développeur Full-Stack',
            company: 'Tech Solutions Inc.',
            location: 'Paris, France',
            start_date: '2020-01-01',
            end_date: null,
            current_job: true,
            description: 'Développement et maintenance d\'applications web avec React, Node.js et MongoDB. Collaboration avec l\'équipe design pour implémenter des interfaces utilisateur responsive.'
          },
          {
            id: 2,
            job_title: 'Développeur Frontend',
            company: 'WebVision',
            location: 'Lyon, France',
            start_date: '2018-06-01',
            end_date: '2019-12-31',
            current_job: false,
            description: 'Création d\'interfaces utilisateur avec Vue.js et intégration avec les API backend. Optimisation des performances et accessibilité des applications.'
          }
        ]

        educations.value = [
          {
            id: 1,
            degree: 'Master en Informatique',
            institution: 'Université Paris-Saclay',
            location: 'Paris, France',
            start_date: '2016-09-01',
            end_date: '2018-06-30',
            current_education: false,
            description: 'Spécialisation en architectures logicielles et développement web.'
          },
          {
            id: 2,
            degree: 'Licence en Informatique',
            institution: 'Université Claude Bernard',
            location: 'Lyon, France',
            start_date: '2013-09-01',
            end_date: '2016-06-30',
            current_education: false,
            description: ''
          }
        ]

        skills.value = [
          { id: 1, skill_name: 'JavaScript', proficiency: 5 },
          { id: 2, skill_name: 'React', proficiency: 4 },
          { id: 3, skill_name: 'Node.js', proficiency: 4 },
          { id: 4, skill_name: 'HTML/CSS', proficiency: 5 },
          { id: 5, skill_name: 'Vue.js', proficiency: 4 },
          { id: 6, skill_name: 'PostgreSQL', proficiency: 3 }
        ]

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    }

    const generatePDF = async () => {
      generatingPDF.value = true
      try {
        // Simulation de génération de PDF
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Créer un lien de téléchargement factice
        const link = document.createElement('a')
        link.href = '#' // Lien vide pour la démo
        link.download = 'mon_cv.pdf'
        link.click()
        
        alert('Votre CV a été généré avec succès!')
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error)
        alert('Erreur lors de la génération du PDF')
      } finally {
        generatingPDF.value = false
      }
    }

    onMounted(() => {
      loadCVData()
    })

    return {
      personalInfo,
      experiences,
      educations,
      skills,
      generatingPDF,
      formatDate,
      generatePDF
    }
  }
}
</script>

<style scoped>
.preview {
  padding: 1rem 0;
}

.preview-header {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.cv-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cv-template {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.cv-header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 1rem;
}

.cv-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.contact-info {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.contact-info p {
  margin: 0;
}

.cv-section {
  margin-bottom: 1.5rem;
}

.cv-section h2 {
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.experience-item, .education-item {
  margin-bottom: 1rem;
}

.experience-item h3, .education-item h3 {
  margin-bottom: 0.25rem;
  color: #34495e;
}

.date-location {
  font-style: italic;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-name {
  min-width: 120px;
}

.skill-level {
  display: flex;
  gap: 2px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
}

.dot.filled {
  background-color: #3498db;
}

a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .preview-actions {
    flex-direction: column;
  }
  
  .contact-info {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .skills-container {
    flex-direction: column;
  }
}
</style>
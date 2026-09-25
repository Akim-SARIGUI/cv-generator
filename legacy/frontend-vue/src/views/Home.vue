<!-- frontend/src/views/Home.vue -->
<template>
  <div class="home">
    <div class="hero-section">
      <h2>Créez un CV professionnel en quelques minutes</h2>
      <p>Notre générateur de CV vous aide à créer un CV personnalisé et élégant qui impressionnera les recruteurs.</p>
      <button @click="$router.push('/editor')" class="btn-primary">
        Commencer maintenant
      </button>
    </div>

    <div class="features-section">
      <h3>Fonctionnalités</h3>
      <div class="features-grid">
        <div class="feature-card">
          <i class="fas fa-edit"></i>
          <h4>Édition facile</h4>
          <p>Interface intuitive pour modifier toutes les sections de votre CV</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-eye"></i>
          <h4>Prévisualisation en temps réel</h4>
          <p>Voyez les modifications apportées à votre CV instantanément</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-file-pdf"></i>
          <h4>Export PDF</h4>
          <p>Téléchargez votre CV en format PDF professionnel</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-mobile-alt"></i>
          <h4>Design responsive</h4>
          <p>Votre CV s'adapte à tous les appareils et écrans</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  padding: 2rem 0;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  background-color: #fff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.features-section {
  margin-bottom: 2rem;
}

.features-section h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card i {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.feature-card h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .hero-section h2 {
    font-size: 2rem;
  }
  
  .hero-section p {
    font-size: 1rem;
  }
}
</style>
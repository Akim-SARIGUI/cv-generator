// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');

// Charger les variables d'environnement
dotenv.config();

// Importer les routes
const authRoutes = require('./routes/auth');
const personalRoutes = require('./routes/personal');
const experienceRoutes = require('./routes/experience');
const educationRoutes = require('./routes/education');
const skillRoutes = require('./routes/skill');
const generateRoutes = require('./routes/generate');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skill', skillRoutes);
app.use('/api/generate', generateRoutes);

// Route de test de santé
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ 
      message: 'CV Generator API is running!',
      database: 'Connected successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'CV Generator API is running!',
      database: 'Connection failed',
      error: error.message 
    });
  }
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`✅ Database connected: ${process.env.DB_NAME}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database connection error:');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
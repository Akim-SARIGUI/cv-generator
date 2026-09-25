// config/database.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuration détaillée avec gestion d'erreurs
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cv_generator',
  user: process.env.DB_USER || 'akm_dev',
  password: process.env.DB_PASSWORD || '',
  // Timeout de connexion
  connectionTimeoutMillis: 5000,
  // Timeout d'inactivité
  idleTimeoutMillis: 30000,
  // Nombre maximum de clients dans le pool
  max: 20,
};

const pool = new Pool(poolConfig);

// Test de la connexion à la base de données
pool.on('connect', (client) => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Tester la connexion au démarrage
testConnection();

module.exports = {
  pool,
  testConnection
};
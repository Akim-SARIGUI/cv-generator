// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_super_securise';

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token invalide' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expiré' });
    }
    
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier si l'utilisateur est le propriétaire de la ressource
const checkOwnership = (req, res, next) => {
  const requestedUserId = parseInt(req.params.userId);
  
  if (req.user.id !== requestedUserId) {
    return res.status(403).json({ error: 'Accès non autorisé à cette ressource' });
  }
  
  next();
};

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    JWT_SECRET, 
    { expiresIn: '7d' } // Token valide 7 jours
  );
};

module.exports = {
  authenticateToken,
  checkOwnership,
  generateToken,
  JWT_SECRET
};
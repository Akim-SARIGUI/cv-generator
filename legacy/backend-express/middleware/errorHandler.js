// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Erreur de validation PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }

  // Erreur de clé étrangère
  if (err.code === '23503') {
    return res.status(404).json({
      error: 'Reference error',
      message: 'The referenced record does not exist'
    });
  }

  // Erreur de validation
  if (err.code === '23502') {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Required field is missing'
    });
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Server error',
    message: 'Something went wrong on the server'
  });
};

module.exports = errorHandler;
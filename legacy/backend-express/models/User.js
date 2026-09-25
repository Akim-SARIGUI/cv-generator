// models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in User.findByEmail:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in User.findById:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { username, email, password } = userData;
      
      // Hacher le mot de passe
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash) 
         VALUES ($1, $2, $3) RETURNING id, username, email, created_at`,
        [username, email, passwordHash]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in User.create:', error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(userId, updateData) {
    try {
      const { username, email } = updateData;
      
      const result = await pool.query(
        `UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 RETURNING id, username, email, created_at, updated_at`,
        [username, email, userId]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in User.update:', error);
      throw error;
    }
  }
}

module.exports = User;
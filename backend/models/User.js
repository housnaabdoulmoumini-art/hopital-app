const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const { email, password, nom, prenom, role, telephone } = userData;
        const password_hash = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, nom, prenom, role, telephone)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, nom, prenom, role, telephone, created_at`,
            [email, password_hash, nom, prenom, role, telephone]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query('SELECT id, email, nom, prenom, role, telephone, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    }
}

module.exports = User;

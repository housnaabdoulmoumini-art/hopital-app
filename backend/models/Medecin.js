const { pool } = require('../config/database');

class Medecin {
    static async create(data) {
        const result = await pool.query(
            `INSERT INTO medecins (user_id, nom, prenom, specialite, numero_ordre, telephone, email, adresse)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [data.user_id, data.nom, data.prenom, data.specialite, data.numero_ordre, data.telephone, data.email, data.adresse]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM medecins ORDER BY nom');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM medecins WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, data) {
        const result = await pool.query(
            `UPDATE medecins SET 
                nom = $1, prenom = $2, specialite = $3, telephone = $4, email = $5, adresse = $6, disponibilite = $7
             WHERE id = $8 RETURNING *`,
            [data.nom, data.prenom, data.specialite, data.telephone, data.email, data.adresse, data.disponibilite, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM medecins WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getDisponibles() {
        const result = await pool.query('SELECT * FROM medecins WHERE disponibilite = $1', ['disponible']);
        return result.rows;
    }
}

module.exports = Medecin;

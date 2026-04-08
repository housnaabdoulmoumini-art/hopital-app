const { pool } = require('../config/database');

class Patient {
    static async create(data) {
        const result = await pool.query(
            `INSERT INTO patients (user_id, nom, prenom, nss, date_naissance, telephone, email, adresse, groupe_sanguin, allergies)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [data.user_id, data.nom, data.prenom, data.nss, data.date_naissance, data.telephone, data.email, data.adresse, data.groupe_sanguin, data.allergies]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM patients ORDER BY nom, prenom');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByNss(nss) {
        const result = await pool.query('SELECT * FROM patients WHERE nss = $1', [nss]);
        return result.rows[0];
    }

    static async update(id, data) {
        const result = await pool.query(
            `UPDATE patients SET 
                nom = $1, prenom = $2, nss = $3, date_naissance = $4, telephone = $5, email = $6, adresse = $7, groupe_sanguin = $8, allergies = $9
             WHERE id = $10 RETURNING *`,
            [data.nom, data.prenom, data.nss, data.date_naissance, data.telephone, data.email, data.adresse, data.groupe_sanguin, data.allergies, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = Patient;

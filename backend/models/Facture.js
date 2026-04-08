const { pool } = require('../config/database');

class Facture {
    static async create(data) {
        const result = await pool.query(
            `INSERT INTO factures (patient_id, date_emission, date_echeance, montant_ht, montant_tva, montant_ttc, statut, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [data.patient_id, data.date_emission, data.date_echeance, data.montant_ht, data.montant_tva, data.montant_ttc, data.statut, data.notes]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM factures ORDER BY id DESC');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM factures WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, data) {
        const result = await pool.query(
            `UPDATE factures SET 
                patient_id = $1, date_emission = $2, date_echeance = $3, 
                montant_ht = $4, montant_tva = $5, montant_ttc = $6, 
                statut = $7, notes = $8, updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 RETURNING *`,
            [data.patient_id, data.date_emission, data.date_echeance, data.montant_ht, data.montant_tva, data.montant_ttc, data.statut, data.notes, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM factures WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = Facture;

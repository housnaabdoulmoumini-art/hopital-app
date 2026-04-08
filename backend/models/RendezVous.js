const { pool } = require('../config/database');

class RendezVous {
    static async create(data) {
        const result = await pool.query(
            `INSERT INTO rendez_vous (patient_id, medecin_id, date_heure, duree_minutes, motif, notes)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [data.patient_id, data.medecin_id, data.date_heure, data.duree_minutes, data.motif, data.notes]
        );
        
        await pool.query(
            `INSERT INTO notifications (user_id, type, titre, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [data.medecin_id, 'rdv_confirme', 'Nouvelle demande de rendez-vous', 'Un nouveau rendez-vous a été demandé', JSON.stringify({ rendez_vous_id: result.rows[0].id })]
        );
        
        return result.rows[0];
    }

    static async findAll(filters = {}) {
        let query = `
            SELECT r.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom, p.telephone as patient_telephone,
                   m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite
            FROM rendez_vous r
            JOIN patients p ON r.patient_id = p.id
            JOIN medecins m ON r.medecin_id = m.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        if (filters.medecin_id) {
            query += ` AND r.medecin_id = $${paramIndex++}`;
            params.push(filters.medecin_id);
        }
        if (filters.patient_id) {
            query += ` AND r.patient_id = $${paramIndex++}`;
            params.push(filters.patient_id);
        }
        if (filters.statut) {
            query += ` AND r.statut = $${paramIndex++}`;
            params.push(filters.statut);
        }
        if (filters.date) {
            query += ` AND DATE(r.date_heure) = $${paramIndex++}`;
            params.push(filters.date);
        }
        
        query += ' ORDER BY r.date_heure';
        
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query(
            `SELECT r.*, 
                    p.nom as patient_nom, p.prenom as patient_prenom, p.telephone as patient_telephone, p.email as patient_email,
                    m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite
             FROM rendez_vous r
             JOIN patients p ON r.patient_id = p.id
             JOIN medecins m ON r.medecin_id = m.id
             WHERE r.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async updateStatus(id, statut) {
        const result = await pool.query(
            `UPDATE rendez_vous SET statut = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [statut, id]
        );
        
        const rdv = await this.findById(id);
        
        let message = '';
        if (statut === 'confirme') {
            message = `Votre rendez-vous du ${new Date(rdv.date_heure).toLocaleString('fr-FR')} a ete confirme`;
        } else if (statut === 'rejete') {
            message = `Votre rendez-vous a ete refuse. Veuillez contacter le secretariat.`;
        }
        
        if (message && rdv) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, titre, message, data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [rdv.patient_id, 'rdv_confirme', 'Mise a jour de votre rendez-vous', message, JSON.stringify({ rendez_vous_id: id, statut })]
            );
        }
        
        return result.rows[0];
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM rendez_vous WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}

module.exports = RendezVous;

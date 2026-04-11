const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Récupérer toutes les factures
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom,
                   m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite
            FROM factures f
            LEFT JOIN patients p ON f.patient_id = p.id
            LEFT JOIN medecins m ON f.medecin_id = m.id
            ORDER BY f.date_emission DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur GET factures:', error);
        res.status(500).json({ error: error.message });
    }
});

// Récupérer une facture par ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom,
                   m.nom as medecin_nom, m.prenom as medecin_prenom
            FROM factures f
            LEFT JOIN patients p ON f.patient_id = p.id
            LEFT JOIN medecins m ON f.medecin_id = m.id
            WHERE f.id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Créer une facture
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, montant_ht, montant_ttc, date_echeance, description } = req.body;
        
        // Générer un numéro de facture unique
        const annee = new Date().getFullYear();
        const count = await pool.query('SELECT COUNT(*) FROM factures');
        const numero = `FAC-${annee}-${String(parseInt(count.rows[0].count) + 1).padStart(3, '0')}`;
        
        const result = await pool.query(
            `INSERT INTO factures (numero, patient_id, medecin_id, date_echeance, montant_ht, montant_ttc, description, statut)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_attente') RETURNING *`,
            [numero, patient_id, medecin_id, date_echeance, montant_ht, montant_ttc, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur POST facture:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour le statut d'une facture
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { statut } = req.body;
        const result = await pool.query(
            `UPDATE factures SET statut = $1 WHERE id = $2 RETURNING *`,
            [statut, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer une facture
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM factures WHERE id = $1', [req.params.id]);
        res.json({ message: 'Facture supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

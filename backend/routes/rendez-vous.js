const express = require('express');
const router = express.Router();
const {
    getAllRendezVous,
    getRendezVousById,
    createRendezVous,
    updateRendezVousStatus,
    deleteRendezVous,
    getRendezVousByMedecin,
    getDemandesEnAttente
} = require('../controllers/rendezVousController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', authenticateToken, getAllRendezVous);
router.get('/mes-demandes', authenticateToken, getDemandesEnAttente);
router.get('/medecin/:medecinId', authenticateToken, getRendezVousByMedecin);
router.get('/:id', authenticateToken, getRendezVousById);
router.post('/', authenticateToken, createRendezVous);
router.patch('/:id/status', authenticateToken, authorize('medecin', 'admin'), updateRendezVousStatus);
router.delete('/:id', authenticateToken, authorize('admin'), deleteRendezVous);

module.exports = router;

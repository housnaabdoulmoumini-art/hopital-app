const express = require('express');
const router = express.Router();
const {
    getAllMedecins,
    getMedecinById,
    createMedecin,
    updateMedecin,
    deleteMedecin,
    getMedecinsDisponibles
} = require('../controllers/medecinController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', authenticateToken, getAllMedecins);
router.get('/disponibles', authenticateToken, getMedecinsDisponibles);
router.get('/:id', authenticateToken, getMedecinById);
router.post('/', authenticateToken, authorize('admin'), createMedecin);
router.put('/:id', authenticateToken, authorize('admin'), updateMedecin);
router.delete('/:id', authenticateToken, authorize('admin'), deleteMedecin);

module.exports = router;

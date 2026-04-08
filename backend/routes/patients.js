const express = require('express');
const router = express.Router();
const {
    getAllPatients,
    getPatientById,
    getPatientByNss,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', authenticateToken, getAllPatients);
router.get('/nss/:nss', authenticateToken, getPatientByNss);
router.get('/:id', authenticateToken, getPatientById);
router.post('/', authenticateToken, authorize('admin', 'secretaire'), createPatient);
router.put('/:id', authenticateToken, authorize('admin', 'secretaire'), updatePatient);
router.delete('/:id', authenticateToken, authorize('admin'), deletePatient);

module.exports = router;

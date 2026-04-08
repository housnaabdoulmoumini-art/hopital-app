const Patient = require('../models/Patient');

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll();
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPatientByNss = async (req, res) => {
    try {
        const patient = await Patient.findByNss(req.params.nss);
        if (!patient) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPatient = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);
        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.update(req.params.id, req.body);
        if (!patient) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.delete(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }
        res.json({ message: 'Patient supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    getPatientByNss,
    createPatient,
    updatePatient,
    deletePatient
};

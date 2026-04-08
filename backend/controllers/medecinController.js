const Medecin = require('../models/Medecin');

const getAllMedecins = async (req, res) => {
    try {
        const medecins = await Medecin.findAll();
        res.json(medecins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMedecinById = async (req, res) => {
    try {
        const medecin = await Medecin.findById(req.params.id);
        if (!medecin) {
            return res.status(404).json({ error: 'Médecin non trouvé' });
        }
        res.json(medecin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMedecin = async (req, res) => {
    try {
        const medecin = await Medecin.create(req.body);
        res.status(201).json(medecin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMedecin = async (req, res) => {
    try {
        const medecin = await Medecin.update(req.params.id, req.body);
        if (!medecin) {
            return res.status(404).json({ error: 'Médecin non trouvé' });
        }
        res.json(medecin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMedecin = async (req, res) => {
    try {
        const medecin = await Medecin.delete(req.params.id);
        if (!medecin) {
            return res.status(404).json({ error: 'Médecin non trouvé' });
        }
        res.json({ message: 'Médecin supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMedecinsDisponibles = async (req, res) => {
    try {
        const medecins = await Medecin.getDisponibles();
        res.json(medecins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllMedecins,
    getMedecinById,
    createMedecin,
    updateMedecin,
    deleteMedecin,
    getMedecinsDisponibles
};

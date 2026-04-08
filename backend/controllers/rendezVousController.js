const RendezVous = require('../models/RendezVous');

const getAllRendezVous = async (req, res) => {
    try {
        const filters = {
            medecin_id: req.query.medecin_id,
            patient_id: req.query.patient_id,
            statut: req.query.statut,
            date: req.query.date
        };
        const rendezVous = await RendezVous.findAll(filters);
        res.json(rendezVous);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRendezVousById = async (req, res) => {
    try {
        const rdv = await RendezVous.findById(req.params.id);
        if (!rdv) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }
        res.json(rdv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRendezVous = async (req, res) => {
    try {
        const rdv = await RendezVous.create(req.body);
        res.status(201).json(rdv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRendezVousStatus = async (req, res) => {
    try {
        const { statut } = req.body;
        if (!['en_attente', 'confirme', 'termine', 'annule', 'rejete'].includes(statut)) {
            return res.status(400).json({ error: 'Statut invalide' });
        }
        
        const rdv = await RendezVous.updateStatus(req.params.id, statut);
        if (!rdv) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }
        res.json(rdv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRendezVous = async (req, res) => {
    try {
        const rdv = await RendezVous.delete(req.params.id);
        if (!rdv) {
            return res.status(404).json({ error: 'Rendez-vous non trouvé' });
        }
        res.json({ message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRendezVousByMedecin = async (req, res) => {
    try {
        const rdvs = await RendezVous.findAll({ medecin_id: req.params.medecinId });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDemandesEnAttente = async (req, res) => {
    try {
        const rdvs = await RendezVous.findAll({ medecin_id: req.user.id, statut: 'en_attente' });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRendezVous,
    getRendezVousById,
    createRendezVous,
    updateRendezVousStatus,
    deleteRendezVous,
    getRendezVousByMedecin,
    getDemandesEnAttente
};

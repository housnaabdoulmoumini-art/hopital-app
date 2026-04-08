const Facture = require('../models/Facture');

const getAllFactures = async (req, res) => {
    try {
        const factures = await Facture.findAll();
        res.json(factures);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getFactureById = async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id);
        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        res.json(facture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createFacture = async (req, res) => {
    try {
        const facture = await Facture.create(req.body);
        res.status(201).json(facture);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateFacture = async (req, res) => {
    try {
        const facture = await Facture.update(req.params.id, req.body);
        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        res.json(facture);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteFacture = async (req, res) => {
    try {
        const facture = await Facture.delete(req.params.id);
        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        res.json({ message: 'Facture supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllFactures, getFactureById, createFacture, updateFacture, deleteFacture };

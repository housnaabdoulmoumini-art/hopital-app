import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Divider,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaidIcon from '@mui/icons-material/Paid';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';

function Factures() {
    const [factures, setFactures] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [localSearch, setLocalSearch] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const printRef = useRef();
    
    const [formData, setFormData] = useState({
        patient_id: '', lignes: [{ description: '', quantite: 1, prix_unitaire: 0 }]
    });

    const currentYear = new Date().getFullYear();
    const currentYearStr = currentYear.toString();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [facturesRes, patientsRes] = await Promise.all([
                axios.get('http://localhost:3001/api/factures', { headers }),
                axios.get('http://localhost:3001/api/patients', { headers })
            ]);
            
            setFactures(facturesRes.data);
            setPatients(patientsRes.data);
        } catch (error) {
            console.error('Erreur:', error);
            setPatients([
                { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678', email: 'marie@email.com', adresse: '12 rue de Paris' },
                { id: 2, nom: 'MARTIN', prenom: 'Jean', telephone: '0623456789', email: 'jean@email.com', adresse: '15 avenue de la République' },
            ]);
            setFactures([
                {
                    id: 1,
                    numero: `FAC-${currentYearStr}-001`,
                    patient: { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678', email: 'marie@email.com', adresse: '12 rue de Paris' },
                    date_emission: new Date().toISOString().split('T')[0],
                    date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                    lignes: [
                        { description: 'Consultation cardiologue', quantite: 1, prix_unitaire: 60, montant: 60 },
                        { description: 'Échographie cardiaque', quantite: 1, prix_unitaire: 120, montant: 120 }
                    ],
                    total_ht: 180,
                    total_ttc: 216,
                    statut: 'en_attente'
                },
                {
                    id: 2,
                    numero: `FAC-${currentYearStr}-002`,
                    patient: { id: 2, nom: 'MARTIN', prenom: 'Jean', telephone: '0623456789', email: 'jean@email.com', adresse: '15 avenue de la République' },
                    date_emission: new Date().toISOString().split('T')[0],
                    date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                    lignes: [
                        { description: 'Consultation pédiatre', quantite: 1, prix_unitaire: 50, montant: 50 }
                    ],
                    total_ht: 50,
                    total_ttc: 60,
                    statut: 'payee'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const generateFactureNumber = () => {
        const nextNumber = (factures.length + 1).toString().padStart(3, '0');
        return `FAC-${currentYearStr}-${nextNumber}`;
    };

    const calculateTotal = (lignes) => {
        const ht = lignes.reduce((sum, l) => sum + (l.quantite * l.prix_unitaire), 0);
        return { ht, ttc: ht * 1.2 };
    };

    const handleAddLigne = () => {
        setFormData({
            ...formData,
            lignes: [...formData.lignes, { description: '', quantite: 1, prix_unitaire: 0 }]
        });
    };

    const handleRemoveLigne = (index) => {
        const newLignes = formData.lignes.filter((_, i) => i !== index);
        setFormData({ ...formData, lignes: newLignes });
    };

    const handleLigneChange = (index, field, value) => {
        const newLignes = [...formData.lignes];
        newLignes[index][field] = value;
        if (field === 'quantite' || field === 'prix_unitaire') {
            newLignes[index].montant = newLignes[index].quantite * newLignes[index].prix_unitaire;
        }
        setFormData({ ...formData, lignes: newLignes });
    };

    const handleSubmit = () => {
        if (!formData.patient_id || formData.lignes.length === 0 || !formData.lignes[0].description) {
            setSnackbar({ open: true, message: 'Veuillez remplir les informations', severity: 'error' });
            return;
        }
        
        const patient = patients.find(p => p.id === parseInt(formData.patient_id));
        const totals = calculateTotal(formData.lignes);
        
        const newFacture = {
            id: factures.length + 1,
            numero: generateFactureNumber(),
            patient: { 
                id: patient.id, 
                nom: patient.nom, 
                prenom: patient.prenom,
                telephone: patient.telephone,
                email: patient.email,
                adresse: patient.adresse
            },
            date_emission: new Date().toISOString().split('T')[0],
            date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
            lignes: formData.lignes,
            total_ht: totals.ht,
            total_ttc: totals.ttc,
            statut: 'en_attente'
        };
        
        setFactures([...factures, newFacture]);
        setOpenDialog(false);
        resetForm();
        setSnackbar({ open: true, message: `Facture ${newFacture.numero} créée`, severity: 'success' });
    };

    const updateStatut = (id, newStatut) => {
        setFactures(factures.map(f => f.id === id ? { ...f, statut: newStatut } : f));
        setSnackbar({ open: true, message: `Facture ${newStatut === 'payee' ? 'payée' : 'annulée'}`, severity: 'success' });
    };

    const resetForm = () => {
        setFormData({
            patient_id: '', lignes: [{ description: '', quantite: 1, prix_unitaire: 0 }]
        });
    };

    // Fonction d'impression
    const handlePrint = (facture) => {
        setSelectedFacture(facture);
        setOpenPrintDialog(true);
    };

    const printFacture = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // Génération PDF (via l'impression)
    const handlePDF = (facture) => {
        setSelectedFacture(facture);
        setTimeout(() => {
            const printContent = printRef.current.innerHTML;
            const originalContent = document.body.innerHTML;
            
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
        }, 100);
    };

    const getStatusChip = (statut) => {
        if (statut === 'payee') return <Chip icon={<PaidIcon />} label="Payée" color="success" size="small" />;
        if (statut === 'en_attente') return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
        return <Chip label="Annulée" color="error" size="small" />;
    };

    const filteredFactures = factures.filter(f =>
        f.patient?.nom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        f.patient?.prenom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        f.numero?.toLowerCase().includes(localSearch.toLowerCase())
    );

    const totalEnAttente = factures.filter(f => f.statut === 'en_attente').reduce((sum, f) => sum + (f.total_ttc || 0), 0);
    const totalPaye = factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + (f.total_ttc || 0), 0);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>💰 Factures</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenDialog(true); }} sx={{ bgcolor: '#00bcd4', py: 1.5, px: 4 }}>
                    + NOUVELLE FACTURE
                </Button>
            </Box>

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="warning.main">{factures.filter(f => f.statut === 'en_attente').length}</Typography>
                        <Typography variant="body2">Factures en attente</Typography>
                        <Typography variant="caption">{totalEnAttente.toFixed(2)} €</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="success.main">{factures.filter(f => f.statut === 'payee').length}</Typography>
                        <Typography variant="body2">Factures payées</Typography>
                        <Typography variant="caption">{totalPaye.toFixed(2)} €</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="primary.main">{factures.length}</Typography>
                        <Typography variant="body2">Total factures</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="info.main">{(totalEnAttente + totalPaye).toFixed(2)} €</Typography>
                        <Typography variant="body2">Chiffre d'affaires</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recherche */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ color: 'action.active' }} />
                <TextField 
                    fullWidth 
                    placeholder="Rechercher par patient ou numéro..." 
                    value={localSearch} 
                    onChange={(e) => setLocalSearch(e.target.value)} 
                    variant="standard" 
                    InputProps={{ disableUnderline: true }} 
                />
            </Paper>

            {/* Tableau des factures */}
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>N° Facture</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Date émission</TableCell>
                            <TableCell>Date échéance</TableCell>
                            <TableCell>Montant TTC</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFactures.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center">Aucune facture</TableCell></TableRow>
                        ) : (
                            filteredFactures.map((facture) => (
                                <TableRow key={facture.id} hover>
                                    <TableCell><Chip label={facture.numero} size="small" variant="outlined" /></TableCell>
                                    <TableCell>{facture.patient?.prenom} {facture.patient?.nom}</TableCell>
                                    <TableCell>{new Date(facture.date_emission).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>{new Date(facture.date_echeance).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell><strong>{facture.total_ttc?.toFixed(2)} €</strong></TableCell>
                                    <TableCell>{getStatusChip(facture.statut)}</TableCell>
                                    <TableCell>
                                        {facture.statut === 'en_attente' && (
                                            <IconButton size="small" color="success" onClick={() => updateStatut(facture.id, 'payee')} title="Marquer payée">
                                                <PaidIcon />
                                            </IconButton>
                                        )}
                                        <IconButton size="small" color="primary" onClick={() => handlePrint(facture)} title="Aperçu / Imprimer">
                                            <PrintIcon />
                                        </IconButton>
                                        <IconButton size="small" color="secondary" onClick={() => handlePDF(facture)} title="Générer PDF">
                                            <PictureAsPdfIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Nouvelle Facture */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>
                    ➕ Nouvelle Facture - Année {currentYearStr}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Patient</InputLabel>
                                <Select value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} label="Patient">
                                    {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>📝 Détails de la facture</Typography>
                            {formData.lignes.map((ligne, index) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} sm={5}>
                                            <TextField fullWidth size="small" label="Description" value={ligne.description} onChange={(e) => handleLigneChange(index, 'description', e.target.value)} />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <TextField fullWidth size="small" label="Quantité" type="number" value={ligne.quantite} onChange={(e) => handleLigneChange(index, 'quantite', parseInt(e.target.value) || 0)} />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <TextField fullWidth size="small" label="Prix unitaire (€)" type="number" value={ligne.prix_unitaire} onChange={(e) => handleLigneChange(index, 'prix_unitaire', parseFloat(e.target.value) || 0)} />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <IconButton color="error" onClick={() => handleRemoveLigne(index)}><DeleteIcon /></IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button size="small" startIcon={<AddIcon />} onClick={handleAddLigne}>Ajouter une ligne</Button>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                                <Typography variant="h6">Total HT: {calculateTotal(formData.lignes).ht.toFixed(2)} €</Typography>
                                <Typography variant="h6" color="primary">Total TTC: {calculateTotal(formData.lignes).ttc.toFixed(2)} €</Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Le numéro de facture sera généré automatiquement au format: FAC-{currentYearStr}-XXX
                            </Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Créer Facture</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Aperçu / Impression Facture */}
            <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    🖨️ Aperçu de la facture
                </DialogTitle>
                <DialogContent>
                    {selectedFacture && (
                        <Box ref={printRef} sx={{ p: 4, fontFamily: 'Arial, sans-serif' }}>
                            {/* En-tête */}
                            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #333', pb: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>HOPITAL V6</Typography>
                                <Typography variant="body2">Centre Hospitalier</Typography>
                                <Typography variant="body2">Tél: 01 23 45 67 89</Typography>
                                <Typography variant="body2">Email: contact@hopital.com</Typography>
                            </Box>

                            {/* Infos facture */}
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>FACTURE</Typography>
                                    <Typography>N°: {selectedFacture.numero}</Typography>
                                    <Typography>Date d'émission: {new Date(selectedFacture.date_emission).toLocaleDateString('fr-FR')}</Typography>
                                    <Typography>Date d'échéance: {new Date(selectedFacture.date_echeance).toLocaleDateString('fr-FR')}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Statut</Typography>
                                    <Chip 
                                        label={selectedFacture.statut === 'payee' ? 'PAYÉE' : 'EN ATTENTE'} 
                                        color={selectedFacture.statut === 'payee' ? 'success' : 'warning'} 
                                        size="small" 
                                    />
                                </Box>
                            </Box>

                            {/* Infos patient */}
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Facturé à :</Typography>
                                <Typography>{selectedFacture.patient?.prenom} {selectedFacture.patient?.nom}</Typography>
                                <Typography>{selectedFacture.patient?.adresse}</Typography>
                                <Typography>Tél: {selectedFacture.patient?.telephone}</Typography>
                                <Typography>Email: {selectedFacture.patient?.email}</Typography>
                            </Box>

                            {/* Tableau des prestations */}
                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="center">Quantité</TableCell>
                                            <TableCell align="right">Prix unitaire</TableCell>
                                            <TableCell align="right">Montant</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedFacture.lignes.map((ligne, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{ligne.description}</TableCell>
                                                <TableCell align="center">{ligne.quantite}</TableCell>
                                                <TableCell align="right">{ligne.prix_unitaire.toFixed(2)} €</TableCell>
                                                <TableCell align="right">{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} €</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Totaux */}
                            <Box sx={{ textAlign: 'right', mt: 2 }}>
                                <Typography variant="body1">Total HT: <strong>{selectedFacture.total_ht?.toFixed(2)} €</strong></Typography>
                                <Typography variant="body1">TVA (20%): <strong>{(selectedFacture.total_ht * 0.2).toFixed(2)} €</strong></Typography>
                                <Typography variant="h6" sx={{ mt: 1, color: '#1976d2' }}>
                                    Total TTC: <strong>{selectedFacture.total_ttc?.toFixed(2)} €</strong>
                                </Typography>
                            </Box>

                            {/* Pied de page */}
                            <Box sx={{ mt: 5, textAlign: 'center', borderTop: '1px solid #ddd', pt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Merci de votre confiance. En cas de retard de paiement, des pénalités seront appliquées.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPrintDialog(false)}>Fermer</Button>
                    <Button onClick={printFacture} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#1976d2' }}>
                        Imprimer
                    </Button>
                    <Button onClick={printFacture} variant="contained" startIcon={<PictureAsPdfIcon />} sx={{ bgcolor: '#f44336' }}>
                        Générer PDF
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Factures;

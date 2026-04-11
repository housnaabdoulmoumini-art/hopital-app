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
import PaidIcon from '@mui/icons-material/Paid';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import axios from 'axios';

function Factures() {
    const [factures, setFactures] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [localSearch, setLocalSearch] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const printRef = useRef();
    
    const [formData, setFormData] = useState({
        patient_id: '',
        medecin_id: '',
        montant_ht: '',
        montant_ttc: '',
        date_echeance: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [facturesRes, patientsRes, medecinsRes] = await Promise.all([
                axios.get('https://hopital-backend.onrender.com/api/factures', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/patients', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/medecins', { headers })
            ]);
            
            setFactures(facturesRes.data);
            setPatients(patientsRes.data);
            setMedecins(medecinsRes.data);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTTC = (ht) => {
        const htValue = parseFloat(ht) || 0;
        return htValue * 1.2;
    };

    const handleMontantChange = (value) => {
        const ht = parseFloat(value) || 0;
        setFormData({
            ...formData,
            montant_ht: ht,
            montant_ttc: ht * 1.2
        });
    };

    const handleSubmit = async () => {
        if (!formData.patient_id) {
            setSnackbar({ open: true, message: 'Veuillez sélectionner un patient', severity: 'error' });
            return;
        }
        if (!formData.medecin_id) {
            setSnackbar({ open: true, message: 'Veuillez sélectionner un médecin', severity: 'error' });
            return;
        }
        if (!formData.montant_ht || formData.montant_ht <= 0) {
            setSnackbar({ open: true, message: 'Veuillez saisir un montant valide', severity: 'error' });
            return;
        }
        if (!formData.date_echeance) {
            setSnackbar({ open: true, message: 'Veuillez saisir une date d\'échéance', severity: 'error' });
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('https://hopital-backend.onrender.com/api/factures', {
                patient_id: parseInt(formData.patient_id),
                medecin_id: parseInt(formData.medecin_id),
                montant_ht: formData.montant_ht,
                montant_ttc: formData.montant_ttc,
                date_echeance: formData.date_echeance,
                description: formData.description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSnackbar({ open: true, message: `Facture ${response.data.numero} créée avec succès`, severity: 'success' });
            fetchData();
            setOpenDialog(false);
            resetForm();
        } catch (error) {
            console.error('Erreur création facture:', error);
            setSnackbar({ open: true, message: 'Erreur lors de la création', severity: 'error' });
        }
    };

    const updateStatut = async (id, newStatut) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`https://hopital-backend.onrender.com/api/factures/${id}/status`, { statut: newStatut }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: `Facture ${newStatut === 'payee' ? 'payée' : 'annulée'}`, severity: 'success' });
            fetchData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur mise à jour', severity: 'error' });
        }
    };

    const resetForm = () => {
        setFormData({
            patient_id: '',
            medecin_id: '',
            montant_ht: '',
            montant_ttc: '',
            date_echeance: '',
            description: ''
        });
    };

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

    const getStatusChip = (statut) => {
        if (statut === 'payee') return <Chip icon={<PaidIcon />} label="Payée" color="success" size="small" />;
        if (statut === 'en_attente') return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
        return <Chip label="Annulée" color="error" size="small" />;
    };

    const filteredFactures = factures.filter(f =>
        (f.patient_nom?.toLowerCase() || '').includes(localSearch.toLowerCase()) ||
        (f.patient_prenom?.toLowerCase() || '').includes(localSearch.toLowerCase()) ||
        (f.medecin_nom?.toLowerCase() || '').includes(localSearch.toLowerCase()) ||
        (f.numero?.toLowerCase() || '').includes(localSearch.toLowerCase())
    );

    const totalEnAttente = factures.filter(f => f.statut === 'en_attente').reduce((sum, f) => sum + (parseFloat(f.montant_ttc) || 0), 0);
    const totalPaye = factures.filter(f => f.statut === 'payee').reduce((sum, f) => sum + (parseFloat(f.montant_ttc) || 0), 0);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>💰 Factures</Typography>

            {/* Barre de recherche et bouton Ajouter sur la même ligne */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                <Paper sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 400 }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    <TextField 
                        fullWidth 
                        placeholder="Rechercher par patient, médecin ou numéro..." 
                        value={localSearch} 
                        onChange={(e) => setLocalSearch(e.target.value)} 
                        variant="standard" 
                        InputProps={{ disableUnderline: true }} 
                    />
                </Paper>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => { resetForm(); setOpenDialog(true); }} 
                    sx={{ bgcolor: '#00bcd4', px: 4, py: 1 }}
                >
                    + Ajouter
                </Button>
            </Box>

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="warning.main">{factures.filter(f => f.statut === 'en_attente').length}</Typography>
                        <Typography variant="body2">En attente</Typography>
                        <Typography variant="caption">{totalEnAttente.toFixed(2)} €</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="success.main">{factures.filter(f => f.statut === 'payee').length}</Typography>
                        <Typography variant="body2">Payées</Typography>
                        <Typography variant="caption">{totalPaye.toFixed(2)} €</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="primary.main">{factures.length}</Typography>
                        <Typography variant="body2">Total</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="info.main">{(totalEnAttente + totalPaye).toFixed(2)} €</Typography>
                        <Typography variant="body2">Chiffre d'affaires</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tableau des factures */}
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>N° Facture</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Médecin</TableCell>
                            <TableCell>Date émission</TableCell>
                            <TableCell>Date échéance</TableCell>
                            <TableCell>Montant TTC</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFactures.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography sx={{ py: 4, color: 'text.secondary' }}>Aucune facture trouvée</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredFactures.map((facture) => (
                                <TableRow key={facture.id} hover>
                                    <TableCell><Chip label={facture.numero} size="small" variant="outlined" /></TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}><PersonIcon sx={{ fontSize: 14 }} /></Avatar>
                                            {facture.patient_prenom} {facture.patient_nom}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 24, height: 24, bgcolor: '#2e7d32' }}><LocalHospitalIcon sx={{ fontSize: 14 }} /></Avatar>
                                            Dr. {facture.medecin_prenom} {facture.medecin_nom}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{new Date(facture.date_emission).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell>{new Date(facture.date_echeance).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell><strong>{parseFloat(facture.montant_ttc).toFixed(2)} €</strong></TableCell>
                                    <TableCell>{getStatusChip(facture.statut)}</TableCell>
                                    <TableCell>
                                        {facture.statut === 'en_attente' && (
                                            <IconButton size="small" color="success" onClick={() => updateStatut(facture.id, 'payee')} title="Marquer payée">
                                                <PaidIcon />
                                            </IconButton>
                                        )}
                                        <IconButton size="small" color="primary" onClick={() => handlePrint(facture)} title="Imprimer">
                                            <PrintIcon />
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ReceiptIcon /> Nouvelle facture</Box>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Patient *</InputLabel>
                                <Select 
                                    value={formData.patient_id} 
                                    onChange={(e) => setFormData({...formData, patient_id: e.target.value})} 
                                    label="Patient *"
                                >
                                    <MenuItem value="">-- Sélectionner un patient --</MenuItem>
                                    {patients.map(p => (
                                        <MenuItem key={p.id} value={p.id}>
                                            {p.prenom} {p.nom} - {p.telephone || 'Pas de téléphone'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Médecin *</InputLabel>
                                <Select 
                                    value={formData.medecin_id} 
                                    onChange={(e) => setFormData({...formData, medecin_id: e.target.value})} 
                                    label="Médecin *"
                                >
                                    <MenuItem value="">-- Sélectionner un médecin --</MenuItem>
                                    {medecins.map(m => (
                                        <MenuItem key={m.id} value={m.id}>
                                            Dr. {m.prenom} {m.nom} - {m.specialite}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                type="number" 
                                label="Montant HT (€)" 
                                value={formData.montant_ht} 
                                onChange={(e) => handleMontantChange(e.target.value)} 
                                required 
                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                type="number" 
                                label="Montant TTC (€)" 
                                value={formData.montant_ttc} 
                                disabled 
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                type="date" 
                                label="Date d'échéance" 
                                value={formData.date_echeance} 
                                onChange={(e) => setFormData({...formData, date_echeance: e.target.value})} 
                                InputLabelProps={{ shrink: true }} 
                                required 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Description" 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                multiline 
                                rows={3} 
                                placeholder="Détails de la prestation (consultation, examen, médicaments...)"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#00bcd4' }}>
                        Émettre la facture
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Impression */}
            <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>🖨️ Aperçu de la facture</DialogTitle>
                <DialogContent>
                    {selectedFacture && (
                        <Box ref={printRef} sx={{ p: 4, fontFamily: 'Arial, sans-serif' }}>
                            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #333', pb: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>HOPITAL V6</Typography>
                                <Typography variant="body2">Centre Hospitalier</Typography>
                                <Typography variant="body2">Tél: 01 23 45 67 89</Typography>
                            </Box>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>FACTURE N° {selectedFacture.numero}</Typography>
                                    <Typography>Date d'émission: {new Date(selectedFacture.date_emission).toLocaleDateString('fr-FR')}</Typography>
                                    <Typography>Date d'échéance: {new Date(selectedFacture.date_echeance).toLocaleDateString('fr-FR')}</Typography>
                                </Box>
                                <Chip label={selectedFacture.statut === 'payee' ? 'PAYÉE' : 'EN ATTENTE'} color={selectedFacture.statut === 'payee' ? 'success' : 'warning'} size="small" />
                            </Box>
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Patient:</Typography>
                                <Typography>{selectedFacture.patient_prenom} {selectedFacture.patient_nom}</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>Médecin:</Typography>
                                <Typography>Dr. {selectedFacture.medecin_prenom} {selectedFacture.medecin_nom}</Typography>
                            </Box>
                            {selectedFacture.description && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Description:</Typography>
                                    <Typography>{selectedFacture.description}</Typography>
                                </Box>
                            )}
                            <Box sx={{ textAlign: 'right', mt: 3 }}>
                                <Typography variant="h6">Total HT: {parseFloat(selectedFacture.montant_ht).toFixed(2)} €</Typography>
                                <Typography variant="h6">TVA (20%): {(parseFloat(selectedFacture.montant_ht) * 0.2).toFixed(2)} €</Typography>
                                <Typography variant="h5" sx={{ color: '#1976d2', mt: 1 }}>Total TTC: {parseFloat(selectedFacture.montant_ttc).toFixed(2)} €</Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPrintDialog(false)}>Fermer</Button>
                    <Button onClick={printFacture} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#1976d2' }}>Imprimer</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Factures;

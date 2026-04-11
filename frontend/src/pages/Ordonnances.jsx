import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    Alert, Snackbar, Card, CardContent, Divider, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import MedicationIcon from '@mui/icons-material/Medication';
import axios from 'axios';

function Ordonnances() {
    const [ordonnances, setOrdonnances] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedOrdo, setSelectedOrdo] = useState(null);
    const [localSearch, setLocalSearch] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const printRef = useRef();
    
    const [formData, setFormData] = useState({
        patient_id: '', medecin_id: '', diagnostic: '', recommandations: '',
        medicaments: [{ nom: '', dosage: '', duree: '', instructions: '' }]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [ordoRes, patientsRes, medecinsRes] = await Promise.all([
                axios.get('https://hopital-backend.onrender.com/api/ordonnances', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/patients', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/medecins', { headers })
            ]);
            
            setOrdonnances(ordoRes.data);
            setPatients(patientsRes.data);
            setMedecins(medecinsRes.data);
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedicament = () => {
        setFormData({
            ...formData,
            medicaments: [...formData.medicaments, { nom: '', dosage: '', duree: '', instructions: '' }]
        });
    };

    const handleRemoveMedicament = (index) => {
        const newMedicaments = formData.medicaments.filter((_, i) => i !== index);
        setFormData({ ...formData, medicaments: newMedicaments });
    };

    const handleMedicamentChange = (index, field, value) => {
        const newMedicaments = [...formData.medicaments];
        newMedicaments[index][field] = value;
        setFormData({ ...formData, medicaments: newMedicaments });
    };

    const handleSubmit = async () => {
        if (!formData.patient_id || !formData.medecin_id || !formData.diagnostic) {
            setSnackbar({ open: true, message: 'Veuillez remplir tous les champs obligatoires', severity: 'error' });
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                patient_id: formData.patient_id,
                medecin_id: formData.medecin_id,
                diagnostic: formData.diagnostic,
                recommandations: formData.recommandations,
                medicaments: formData.medicaments.filter(m => m.nom)
            };
            
            if (isEditing && selectedOrdo) {
                await axios.put(`https://hopital-backend.onrender.com/api/ordonnances/${selectedOrdo.id}`, dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Ordonnance modifiée', severity: 'success' });
            } else {
                await axios.post('https://hopital-backend.onrender.com/api/ordonnances', dataToSend, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Ordonnance créée', severity: 'success' });
            }
            fetchData();
            setOpenDialog(false);
            resetForm();
        } catch (error) {
            console.error('Erreur:', error);
            setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette ordonnance ?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`https://hopital-backend.onrender.com/api/ordonnances/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Ordonnance supprimée', severity: 'success' });
                fetchData();
            } catch (error) {
                setSnackbar({ open: true, message: 'Erreur suppression', severity: 'error' });
            }
        }
    };

    const openEditDialog = (ordo) => {
        setIsEditing(true);
        setSelectedOrdo(ordo);
        setFormData({
            patient_id: ordo.patient.id.toString(),
            medecin_id: ordo.medecin.id.toString(),
            diagnostic: ordo.diagnostic,
            recommandations: ordo.recommandations,
            medicaments: ordo.medicaments
        });
        setOpenDialog(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setSelectedOrdo(null);
        setFormData({
            patient_id: '', medecin_id: '', diagnostic: '', recommandations: '',
            medicaments: [{ nom: '', dosage: '', duree: '', instructions: '' }]
        });
    };

    const handlePrint = (ordo) => {
        setSelectedOrdo(ordo);
        setOpenPrintDialog(true);
    };

    const printOrdonnance = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const filteredOrdonnances = ordonnances.filter(o =>
        o.patient?.nom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        o.patient?.prenom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        o.diagnostic?.toLowerCase().includes(localSearch.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>💊 Ordonnances</Typography>

            {/* Barre de recherche et bouton Ajouter sur la même ligne */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                <Paper sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 400 }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    <TextField 
                        fullWidth 
                        placeholder="Rechercher par patient..." 
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

            {filteredOrdonnances.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="text.secondary">Aucune ordonnance trouvée</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredOrdonnances.map((ordo) => (
                        <Grid item xs={12} md={6} key={ordo.id}>
                            <Card sx={{ borderRadius: 3, '&:hover': { boxShadow: 6 } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#4caf50' }}><MedicationIcon /></Avatar>
                                            <Box>
                                                <Typography variant="h6">{ordo.patient?.prenom} {ordo.patient?.nom}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Dr. {ordo.medecin?.prenom} {ordo.medecin?.nom} - {ordo.medecin?.specialite}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip label={ordo.statut === 'active' ? 'Active' : 'Expirée'} color={ordo.statut === 'active' ? 'success' : 'default'} size="small" />
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary">
                                        Date: {new Date(ordo.date_creation).toLocaleDateString('fr-FR')}
                                    </Typography>
                                    
                                    <Divider sx={{ my: 1.5 }} />
                                    
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Diagnostic:</Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>{ordo.diagnostic}</Typography>
                                    
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Recommandations:</Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>{ordo.recommandations}</Typography>
                                    
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>💊 Médicaments:</Typography>
                                    {ordo.medicaments?.map((med, idx) => (
                                        <Paper key={idx} sx={{ p: 1, mt: 1, bgcolor: '#f5f5f5' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{med.nom} - {med.dosage}</Typography>
                                            <Typography variant="caption">Durée: {med.duree}</Typography>
                                            <Typography variant="caption" display="block">{med.instructions}</Typography>
                                        </Paper>
                                    ))}
                                    
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button size="small" startIcon={<EditIcon />} onClick={() => openEditDialog(ordo)}>Modifier</Button>
                                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(ordo.id)}>Supprimer</Button>
                                        <Button size="small" startIcon={<PrintIcon />} onClick={() => handlePrint(ordo)}>Imprimer</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog Impression */}
            <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>🖨️ Aperçu ordonnance</DialogTitle>
                <DialogContent>
                    {selectedOrdo && (
                        <Box ref={printRef} sx={{ p: 4, fontFamily: 'Arial, sans-serif' }}>
                            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #333', pb: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>HOPITAL V6</Typography>
                                <Typography variant="body2">Centre Hospitalier</Typography>
                                <Typography variant="body2">Tél: 01 23 45 67 89</Typography>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Médecin prescripteur</Typography>
                                <Typography>Dr. {selectedOrdo.medecin?.prenom} {selectedOrdo.medecin?.nom}</Typography>
                                <Typography>Spécialité: {selectedOrdo.medecin?.specialite}</Typography>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Patient</Typography>
                                <Typography>Nom: {selectedOrdo.patient?.prenom} {selectedOrdo.patient?.nom}</Typography>
                                <Typography>Date: {new Date(selectedOrdo.date_creation).toLocaleDateString('fr-FR')}</Typography>
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '1px solid #333', mb: 2 }}>Ordonnance</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Diagnostic:</Typography>
                                <Typography sx={{ mb: 2 }}>{selectedOrdo.diagnostic}</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Recommandations:</Typography>
                                <Typography sx={{ mb: 2 }}>{selectedOrdo.recommandations}</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Traitement prescrit:</Typography>
                                {selectedOrdo.medicaments?.map((med, idx) => (
                                    <Box key={idx} sx={{ mb: 2, pl: 2 }}>
                                        <Typography sx={{ fontWeight: 'bold' }}>▪ {med.nom} {med.dosage}</Typography>
                                        <Typography sx={{ ml: 2 }}>Posologie: {med.instructions}</Typography>
                                        <Typography sx={{ ml: 2 }}>Durée: {med.duree}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <Box sx={{ mt: 5, textAlign: 'right' }}>
                                <Typography>Signature du médecin</Typography>
                                <Box sx={{ borderTop: '1px solid #333', width: '200px', mt: 1, ml: 'auto' }} />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPrintDialog(false)}>Fermer</Button>
                    <Button onClick={printOrdonnance} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#1976d2' }}>Imprimer</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Ajout/Modification */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>
                    {isEditing ? '✏️ Modifier l\'ordonnance' : '➕ Nouvelle ordonnance'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Patient</InputLabel>
                                <Select value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} label="Patient">
                                    {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Médecin</InputLabel>
                                <Select value={formData.medecin_id} onChange={(e) => setFormData({...formData, medecin_id: e.target.value})} label="Médecin">
                                    {medecins.map(m => <MenuItem key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Diagnostic" value={formData.diagnostic} onChange={(e) => setFormData({...formData, diagnostic: e.target.value})} multiline rows={2} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Recommandations" value={formData.recommandations} onChange={(e) => setFormData({...formData, recommandations: e.target.value})} multiline rows={2} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>💊 Médicaments</Typography>
                            {formData.medicaments.map((med, index) => (
                                <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Médicament" value={med.nom} onChange={(e) => handleMedicamentChange(index, 'nom', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={2}><TextField fullWidth size="small" label="Dosage" value={med.dosage} onChange={(e) => handleMedicamentChange(index, 'dosage', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Durée" value={med.duree} onChange={(e) => handleMedicamentChange(index, 'duree', e.target.value)} placeholder="7 jours" /></Grid>
                                        <Grid item xs={12} sm={3}><TextField fullWidth size="small" label="Instructions" value={med.instructions} onChange={(e) => handleMedicamentChange(index, 'instructions', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={1}><IconButton color="error" onClick={() => handleRemoveMedicament(index)}><DeleteIcon /></IconButton></Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button size="small" startIcon={<AddIcon />} onClick={handleAddMedicament}>Ajouter un médicament</Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#00bcd4' }}>
                        {isEditing ? 'Modifier' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Ordonnances;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    Alert, Snackbar, FormControl, InputLabel, Select, MenuItem, Card, CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

function Hospitalisations() {
    const [hospitalisations, setHospitalisations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [medecins, setMedecins] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedHosp, setSelectedHosp] = useState(null);
    const [localSearch, setLocalSearch] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [formData, setFormData] = useState({
        patient_id: '', medecin_id: '', date_admission: '', motif: '', service: '', chambre: '', observations: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setPatients([
            { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678' },
            { id: 2, nom: 'MARTIN', prenom: 'Jean', telephone: '0623456789' },
            { id: 3, nom: 'BERNARD', prenom: 'Sophie', telephone: '0634567890' },
        ]);
        
        setMedecins([
            { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue' },
            { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
            { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste' },
        ]);
        
        setHospitalisations([
            {
                id: 1,
                patient: { id: 1, nom: 'DUPONT', prenom: 'Marie' },
                medecin: { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue' },
                date_admission: '2024-01-15T10:00:00',
                motif: 'Examen cardiologique approfondi suite à des douleurs thoraciques',
                service: 'Cardiologie',
                chambre: 'A101',
                statut: 'en_cours',
                observations: 'Patient stable, surveillance ECG quotidienne'
            },
            {
                id: 2,
                patient: { id: 2, nom: 'MARTIN', prenom: 'Jean' },
                medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
                date_admission: '2024-01-10T14:30:00',
                date_sortie: '2024-01-12T09:00:00',
                motif: 'Forte fièvre et déshydratation',
                service: 'Pédiatrie',
                chambre: 'B205',
                statut: 'termine',
                observations: 'Patient guéri, sortie autorisée'
            },
            {
                id: 3,
                patient: { id: 3, nom: 'BERNARD', prenom: 'Sophie' },
                medecin: { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste' },
                date_admission: '2024-01-05T08:00:00',
                motif: 'Fracture du poignet droit',
                service: 'Orthopédie',
                chambre: 'C308',
                statut: 'en_cours',
                observations: 'Plâtre posé, contrôle dans 1 semaine'
            }
        ]);
    };

    const handleSubmit = () => {
        if (!formData.patient_id || !formData.medecin_id || !formData.motif || !formData.date_admission) {
            setSnackbar({ open: true, message: 'Veuillez remplir tous les champs obligatoires', severity: 'error' });
            return;
        }
        
        const patient = patients.find(p => p.id === parseInt(formData.patient_id));
        const medecin = medecins.find(m => m.id === parseInt(formData.medecin_id));
        
        const newHosp = {
            id: hospitalisations.length + 1,
            patient: { id: patient.id, nom: patient.nom, prenom: patient.prenom },
            medecin: { id: medecin.id, nom: medecin.nom, prenom: medecin.prenom, specialite: medecin.specialite },
            ...formData,
            statut: 'en_cours'
        };
        
        if (isEditing && selectedHosp) {
            setHospitalisations(hospitalisations.map(h => h.id === selectedHosp.id ? newHosp : h));
            setSnackbar({ open: true, message: 'Hospitalisation modifiée', severity: 'success' });
        } else {
            setHospitalisations([...hospitalisations, newHosp]);
            setSnackbar({ open: true, message: 'Hospitalisation enregistrée', severity: 'success' });
        }
        
        setOpenDialog(false);
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm('Supprimer cette hospitalisation ?')) {
            setHospitalisations(hospitalisations.filter(h => h.id !== id));
            setSnackbar({ open: true, message: 'Hospitalisation supprimée', severity: 'success' });
        }
    };

    const updateStatut = (id, newStatut) => {
        setHospitalisations(hospitalisations.map(h => h.id === id ? { ...h, statut: newStatut } : h));
        setSnackbar({ open: true, message: `Hospitalisation ${newStatut === 'termine' ? 'terminée' : 'annulée'}`, severity: 'success' });
    };

    const openEditDialog = (hosp) => {
        setIsEditing(true);
        setSelectedHosp(hosp);
        setFormData({
            patient_id: hosp.patient.id.toString(),
            medecin_id: hosp.medecin.id.toString(),
            date_admission: hosp.date_admission,
            motif: hosp.motif,
            service: hosp.service,
            chambre: hosp.chambre,
            observations: hosp.observations
        });
        setOpenDialog(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setSelectedHosp(null);
        setFormData({
            patient_id: '', medecin_id: '', date_admission: '', motif: '', service: '', chambre: '', observations: ''
        });
    };

    const getStatusChip = (statut) => {
        if (statut === 'en_cours') return <Chip icon={<PendingIcon />} label="En cours" color="warning" size="small" />;
        if (statut === 'termine') return <Chip icon={<CheckCircleIcon />} label="Terminé" color="success" size="small" />;
        return <Chip label="Annulé" color="error" size="small" />;
    };

    const filteredHospitalisations = hospitalisations.filter(h =>
        h.patient.nom.toLowerCase().includes(localSearch.toLowerCase()) ||
        h.patient.prenom.toLowerCase().includes(localSearch.toLowerCase()) ||
        h.service.toLowerCase().includes(localSearch.toLowerCase())
    );

    const enCours = hospitalisations.filter(h => h.statut === 'en_cours').length;
    const termines = hospitalisations.filter(h => h.statut === 'termine').length;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>🏥 Hospitalisations</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenDialog(true); }} sx={{ bgcolor: '#00bcd4', py: 1.5, px: 4 }}>
                    + NOUVELLE HOSPITALISATION
                </Button>
            </Box>

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="warning.main">{enCours}</Typography>
                        <Typography variant="body2">En cours</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="success.main">{termines}</Typography>
                        <Typography variant="body2">Terminées</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <Typography variant="h4" color="primary.main">{hospitalisations.length}</Typography>
                        <Typography variant="body2">Total</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recherche */}
            <Paper sx={{ p: 2, mb: 4, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ color: 'action.active' }} />
                <TextField fullWidth placeholder="Rechercher par patient ou service..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} />
            </Paper>

            {/* Liste des hospitalisations */}
            {filteredHospitalisations.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="text.secondary">Aucune hospitalisation</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {filteredHospitalisations.map((hosp) => (
                        <Grid item xs={12} md={6} key={hosp.id}>
                            <Card sx={{ borderRadius: 3, '&:hover': { boxShadow: 6 } }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#1976d2' }}><LocalHospitalIcon /></Avatar>
                                            <Box>
                                                <Typography variant="h6">{hosp.patient.prenom} {hosp.patient.nom}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Dr. {hosp.medecin.prenom} {hosp.medecin.nom} - {hosp.medecin.specialite}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        {getStatusChip(hosp.statut)}
                                    </Box>
                                    
                                    <Typography variant="body2">
                                        <strong>Admission:</strong> {new Date(hosp.date_admission).toLocaleString('fr-FR')}
                                    </Typography>
                                    {hosp.date_sortie && (
                                        <Typography variant="body2">
                                            <strong>Sortie:</strong> {new Date(hosp.date_sortie).toLocaleString('fr-FR')}
                                        </Typography>
                                    )}
                                    <Typography variant="body2"><strong>Service:</strong> {hosp.service} - Chambre: {hosp.chambre}</Typography>
                                    <Typography variant="body2"><strong>Motif:</strong> {hosp.motif}</Typography>
                                    <Typography variant="body2"><strong>Observations:</strong> {hosp.observations}</Typography>
                                    
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Button size="small" startIcon={<EditIcon />} onClick={() => openEditDialog(hosp)}>Modifier</Button>
                                        {hosp.statut === 'en_cours' && (
                                            <Button size="small" color="success" startIcon={<CheckCircleIcon />} onClick={() => updateStatut(hosp.id, 'termine')}>Sortie patient</Button>
                                        )}
                                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(hosp.id)}>Supprimer</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Dialog Nouvelle/Modification */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>
                    {isEditing ? '✏️ Modifier l\'hospitalisation' : '➕ Nouvelle hospitalisation'}
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
                                <InputLabel>Médecin responsable</InputLabel>
                                <Select value={formData.medecin_id} onChange={(e) => setFormData({...formData, medecin_id: e.target.value})} label="Médecin responsable">
                                    {medecins.map(m => <MenuItem key={m.id} value={m.id}>Dr. {m.prenom} {m.nom}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="datetime-local" label="Date d'admission" value={formData.date_admission} onChange={(e) => setFormData({...formData, date_admission: e.target.value})} InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Service" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Chambre" value={formData.chambre} onChange={(e) => setFormData({...formData, chambre: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Motif d'hospitalisation" value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} multiline rows={2} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Observations médicales" value={formData.observations} onChange={(e) => setFormData({...formData, observations: e.target.value})} multiline rows={2} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#00bcd4' }}>
                        {isEditing ? 'Modifier' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Hospitalisations;

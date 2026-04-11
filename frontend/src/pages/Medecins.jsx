import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip, Avatar, Alert, Snackbar,
    FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

function Medecins() {
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [formData, setFormData] = useState({ id: '', nom: '', prenom: '', specialite: '', telephone: '', email: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Données mockées
    const mockDoctors = [
        { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue', telephone: '0612345678', email: 'jean.dupont@hopital.com', numero_ordre: '01', disponibilite: 'disponible' },
        { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre', telephone: '0623456789', email: 'sophie.lebrun@hopital.com', numero_ordre: '02', disponibilite: 'disponible' },
        { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste', telephone: '0634567890', email: 'pierre.martin@hopital.com', numero_ordre: '03', disponibilite: 'occupe' },
        { id: 4, nom: 'BERNARD', prenom: 'Marie', specialite: 'Dermatologue', telephone: '0645678901', email: 'marie.bernard@hopital.com', numero_ordre: '04', disponibilite: 'disponible' },
        { id: 5, nom: 'ROBERT', prenom: 'Thomas', specialite: 'Neurologue', telephone: '0656789012', email: 'thomas.robert@hopital.com', numero_ordre: '05', disponibilite: 'conges' },
    ];

    const mockAppointments = [
        { id: 1, patient: { nom: 'DUPONT', prenom: 'Marie' }, medecin: { id: 1, nom: 'DUPONT', prenom: 'Jean' }, date_heure: '2024-01-15T10:00:00', statut: 'confirme', motif: 'Consultation' },
        { id: 2, patient: { nom: 'MARTIN', prenom: 'Jean' }, medecin: { id: 1, nom: 'DUPONT', prenom: 'Jean' }, date_heure: '2024-01-15T14:30:00', statut: 'en_attente', motif: 'Suivi' },
        { id: 3, patient: { nom: 'BERNARD', prenom: 'Sophie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-16T09:00:00', statut: 'confirme', motif: 'Vaccination' },
    ];

    useEffect(() => {
        fetchMedecins();
        fetchAppointments();
    }, []);

    const fetchMedecins = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('https://hopital-backend.onrender.com/api/medecins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
        } catch (error) {
            console.log('Utilisation des données mockées pour les médecins');
            setDoctors(mockDoctors);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('https://hopital-backend.onrender.com/api/rendez-vous', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (error) {
            console.log('Utilisation des données mockées pour les rendez-vous');
            setAppointments(mockAppointments);
        }
    };

    const handleAddMedecin = () => {
        if (!formData.nom || !formData.prenom || !formData.specialite) {
            setSnackbar({ open: true, message: 'Remplir tous les champs', severity: 'error' });
            return;
        }
        const newDoctor = { 
            ...formData, 
            id: doctors.length + 1, 
            numero_ordre: String(doctors.length + 1).padStart(2, '0'), 
            disponibilite: 'disponible' 
        };
        setDoctors([...doctors, newDoctor]);
        setOpenDialog(false);
        resetForm();
        setSnackbar({ open: true, message: 'Médecin ajouté', severity: 'success' });
    };

    const handleEditMedecin = () => {
        setDoctors(doctors.map(d => d.id === formData.id ? { ...formData, numero_ordre: d.numero_ordre, disponibilite: d.disponibilite } : d));
        if (selectedDoctor?.id === formData.id) setSelectedDoctor({ ...formData });
        setOpenDialog(false);
        resetForm();
        setSnackbar({ open: true, message: 'Médecin modifié', severity: 'success' });
    };

    const handleDeleteMedecin = (id) => {
        if (window.confirm('Supprimer ce médecin ?')) {
            setDoctors(doctors.filter(d => d.id !== id));
            if (selectedDoctor?.id === id) setSelectedDoctor(null);
            setSnackbar({ open: true, message: 'Médecin supprimé', severity: 'success' });
        }
    };

    const openAddDialog = () => { setIsEditing(false); resetForm(); setOpenDialog(true); };
    const openEditDialog = (doctor) => { setIsEditing(true); setFormData(doctor); setOpenDialog(true); };
    const resetForm = () => { setFormData({ id: '', nom: '', prenom: '', specialite: '', telephone: '', email: '' }); };

    const getStatusIcon = (status) => {
        if (status === 'disponible') return <Chip icon={<CheckCircleIcon />} label="Disponible" color="success" size="small" />;
        if (status === 'occupe') return <Chip icon={<PendingIcon />} label="Occupé" color="warning" size="small" />;
        return <Chip icon={<CancelIcon />} label="Congés" color="error" size="small" />;
    };

    const filteredDoctors = doctors.filter(d =>
        d.nom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        d.prenom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        d.specialite?.toLowerCase().includes(localSearch.toLowerCase())
    );

    const doctorAppointments = appointments.filter(a => a.medecin?.id === selectedDoctor?.id);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>👨‍⚕️ Gestion des Médecins</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                <Paper sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 400 }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    <TextField fullWidth placeholder="Rechercher..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} />
                </Paper>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog} sx={{ bgcolor: '#00bcd4', px: 4, py: 1 }}>
                    + Ajouter
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: '#00bcd4', color: 'white' }}><Typography variant="h6">📋 Liste des médecins ({filteredDoctors.length})</Typography></Box>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>N°</TableCell>
                                        <TableCell>Nom & Prénom</TableCell>
                                        <TableCell>Spécialité</TableCell>
                                        <TableCell>Statut</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDoctors.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} align="center">Aucun médecin</TableCell></TableRow>
                                    ) : (
                                        filteredDoctors.map((doctor) => (
                                            <TableRow key={doctor.id} hover selected={selectedDoctor?.id === doctor.id}>
                                                <TableCell onClick={() => setSelectedDoctor(doctor)}><Chip label={doctor.numero_ordre} size="small" color="primary" variant="outlined" /></TableCell>
                                                <TableCell onClick={() => setSelectedDoctor(doctor)}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#00bcd4' }}>{doctor.prenom?.charAt(0)}</Avatar>
                                                        <Typography variant="body2">Dr. {doctor.prenom} {doctor.nom}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell onClick={() => setSelectedDoctor(doctor)}><Chip label={doctor.specialite} size="small" variant="outlined" /></TableCell>
                                                <TableCell onClick={() => setSelectedDoctor(doctor)}>{getStatusIcon(doctor.disponibilite)}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" color="info" onClick={() => openEditDialog(doctor)}><EditIcon /></IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteMedecin(doctor.id)}><DeleteIcon /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                    {selectedDoctor ? (
                        <Paper sx={{ borderRadius: 3, p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: '#00bcd4', fontSize: 40 }}>{selectedDoctor.prenom?.charAt(0)}{selectedDoctor.nom?.charAt(0)}</Avatar>
                                <Box>
                                    <Typography variant="h5">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</Typography>
                                    <Typography variant="body1" color="primary">{selectedDoctor.specialite}</Typography>
                                    <Typography variant="body2"><PhoneIcon sx={{ fontSize: 14 }} /> {selectedDoctor.telephone || '-'}</Typography>
                                    <Typography variant="body2"><EmailIcon sx={{ fontSize: 14 }} /> {selectedDoctor.email || '-'}</Typography>
                                </Box>
                            </Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>📅 Rendez-vous</Typography>
                            {doctorAppointments.length === 0 ? (
                                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}><Typography color="text.secondary">Aucun rendez-vous</Typography></Paper>
                            ) : (
                                doctorAppointments.map((app) => (
                                    <Paper key={app.id} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography><strong>Patient:</strong> {app.patient?.prenom} {app.patient?.nom}</Typography>
                                        <Typography><strong>Date:</strong> {app.date_heure ? new Date(app.date_heure).toLocaleString('fr-FR') : 'Date non définie'}</Typography>
                                        <Typography><strong>Motif:</strong> {app.motif}</Typography>
                                        <Chip label={app.statut === 'confirme' ? 'Confirmé' : 'En attente'} size="small" color={app.statut === 'confirme' ? 'success' : 'warning'} />
                                    </Paper>
                                ))
                            )}
                        </Paper>
                    ) : (
                        <Paper sx={{ borderRadius: 3, p: 5, textAlign: 'center' }}><Typography color="text.secondary">👈 Cliquez sur un médecin pour voir ses détails</Typography></Paper>
                    )}
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>{isEditing ? '✏️ Modifier' : '➕ Ajouter un médecin'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Prénom" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Spécialité</InputLabel>
                                <Select value={formData.specialite} onChange={(e) => setFormData({...formData, specialite: e.target.value})} label="Spécialité">
                                    <MenuItem value="Cardiologue">Cardiologue</MenuItem>
                                    <MenuItem value="Pédiatre">Pédiatre</MenuItem>
                                    <MenuItem value="Généraliste">Généraliste</MenuItem>
                                    <MenuItem value="Dermatologue">Dermatologue</MenuItem>
                                    <MenuItem value="Neurologue">Neurologue</MenuItem>
                                    <MenuItem value="Ophtalmologue">Ophtalmologue</MenuItem>
                                    <MenuItem value="Orthopédiste">Orthopédiste</MenuItem>
                                    <MenuItem value="Psychiatre">Psychiatre</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDialog(false)}>Annuler</Button><Button onClick={isEditing ? handleEditMedecin : handleAddMedecin} variant="contained" sx={{ bgcolor: '#00bcd4' }}>{isEditing ? 'Modifier' : 'Ajouter'}</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
        </Box>
    );
}

export default Medecins;

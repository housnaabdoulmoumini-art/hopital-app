import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, CircularProgress, Tabs, Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';

function RendezVous() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [localSearch, setLocalSearch] = useState('');
    const [formData, setFormData] = useState({ id: '', patient_id: '', medecin_id: '', date: '', heure: '', duree: 20, motif: '', notes: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const mockPatients = [
        { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678' },
        { id: 2, nom: 'MARTIN', prenom: 'Jean', telephone: '0623456789' },
        { id: 3, nom: 'BERNARD', prenom: 'Sophie', telephone: '0634567890' },
    ];
    const mockDoctors = [
        { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue' },
        { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
        { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste' },
    ];
    const mockAppointments = [
        { id: 1, patient: { id: 1, nom: 'DUPONT', prenom: 'Marie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-20T10:00:00', statut: 'confirme', motif: 'Consultation', duree: 20, notes: '' },
        { id: 2, patient: { id: 2, nom: 'MARTIN', prenom: 'Jean' }, medecin: { id: 1, nom: 'DUPONT', prenom: 'Jean' }, date_heure: '2024-01-20T14:30:00', statut: 'en_attente', motif: 'Suivi cardiaque', duree: 20, notes: '' },
        { id: 3, patient: { id: 3, nom: 'BERNARD', prenom: 'Sophie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-21T09:00:00', statut: 'confirme', motif: 'Vaccination', duree: 20, notes: '' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const [rdvRes, medecinsRes, patientsRes] = await Promise.all([
                axios.get('https://hopital-backend.onrender.com/api/rendez-vous', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/medecins', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/patients', { headers })
            ]);
            setAppointments(rdvRes.data);
            setDoctors(medecinsRes.data);
            setPatients(patientsRes.data);
        } catch (error) {
            console.log('Utilisation des données mockées pour les rendez-vous');
            setPatients(mockPatients);
            setDoctors(mockDoctors);
            setAppointments(mockAppointments);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = () => {
        if (!formData.patient_id || !formData.medecin_id || !formData.date || !formData.heure) {
            setSnackbar({ open: true, message: 'Tous les champs sont requis', severity: 'error' });
            return;
        }
        const patient = patients.find(p => p.id === parseInt(formData.patient_id));
        const medecin = doctors.find(d => d.id === parseInt(formData.medecin_id));
        const dateHeure = `${formData.date}T${formData.heure}`;
        const newAppointment = {
            id: appointments.length + 1,
            patient: { id: patient.id, nom: patient.nom, prenom: patient.prenom },
            medecin: { id: medecin.id, nom: medecin.nom, prenom: medecin.prenom },
            date_heure: dateHeure,
            statut: 'en_attente',
            motif: formData.motif,
            duree: formData.duree,
            notes: formData.notes
        };
        setAppointments([...appointments, newAppointment]);
        setOpenDialog(false);
        resetForm();
        setSnackbar({ open: true, message: 'Rendez-vous ajouté', severity: 'success' });
    };

    const handleEditAppointment = () => {
        const patient = patients.find(p => p.id === parseInt(formData.patient_id));
        const medecin = doctors.find(d => d.id === parseInt(formData.medecin_id));
        const dateHeure = `${formData.date}T${formData.heure}`;
        setAppointments(appointments.map(a => a.id === formData.id ? { ...a, patient, medecin, date_heure: dateHeure, motif: formData.motif, duree: formData.duree, notes: formData.notes } : a));
        setOpenEditDialog(false);
        resetForm();
        setSnackbar({ open: true, message: 'Rendez-vous modifié', severity: 'success' });
    };

    const updateStatus = (id, newStatus) => {
        setAppointments(appointments.map(a => a.id === id ? { ...a, statut: newStatus } : a));
        setSnackbar({ open: true, message: `Statut: ${newStatus}`, severity: 'success' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Supprimer ce rendez-vous ?')) {
            setAppointments(appointments.filter(a => a.id !== id));
            setSnackbar({ open: true, message: 'Rendez-vous supprimé', severity: 'success' });
        }
    };

    const openEdit = (appointment) => {
        setIsEditing(true);
        const date = appointment.date_heure ? appointment.date_heure.split('T')[0] : '';
        const heure = appointment.date_heure ? appointment.date_heure.split('T')[1]?.substring(0, 5) : '';
        setFormData({
            id: appointment.id, patient_id: appointment.patient.id, medecin_id: appointment.medecin.id,
            date: date, heure: heure, duree: appointment.duree || 20, motif: appointment.motif || '', notes: appointment.notes || ''
        });
        setOpenEditDialog(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ id: '', patient_id: '', medecin_id: '', date: '', heure: '', duree: 20, motif: '', notes: '' });
    };

    const getStatusChip = (status) => {
        if (status === 'confirme') return <Chip icon={<CheckCircleIcon />} label="Confirmé" color="success" size="small" />;
        if (status === 'en_attente') return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
        if (status === 'termine') return <Chip icon={<CheckCircleIcon />} label="Terminé" color="info" size="small" />;
        return <Chip icon={<CancelIcon />} label="Annulé" color="error" size="small" />;
    };

    const filteredAppointments = appointments.filter(a => {
        const search = localSearch.toLowerCase();
        return (a.patient?.prenom?.toLowerCase() || '').includes(search) ||
               (a.patient?.nom?.toLowerCase() || '').includes(search) ||
               (a.medecin?.prenom?.toLowerCase() || '').includes(search) ||
               (a.medecin?.nom?.toLowerCase() || '').includes(search);
    }).filter(a => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return a.statut === 'en_attente';
        if (tabValue === 2) return a.statut === 'confirme';
        return true;
    });

    const stats = {
        total: appointments.length,
        enAttente: appointments.filter(a => a.statut === 'en_attente').length,
        confirmes: appointments.filter(a => a.statut === 'confirme').length,
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>📅 Gestion des Rendez-vous</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                <Paper sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 400 }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    <TextField fullWidth placeholder="Rechercher..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} />
                </Paper>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { resetForm(); setOpenDialog(true); }} sx={{ bgcolor: '#00bcd4', px: 4, py: 1 }}>
                    + Ajouter
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="primary.main">{stats.total}</Typography><Typography variant="caption">Total RDV</Typography></Paper></Grid>
                <Grid item xs={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="warning.main">{stats.enAttente}</Typography><Typography variant="caption">En attente</Typography></Paper></Grid>
                <Grid item xs={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4" color="success.main">{stats.confirmes}</Typography><Typography variant="caption">Confirmés</Typography></Paper></Grid>
            </Grid>

            <Paper sx={{ borderRadius: 3, mb: 3 }}><Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }}><Tab label="📋 Tous" /><Tab label="⏳ En attente" /><Tab label="✅ Confirmés" /></Tabs></Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow><TableCell>Patient</TableCell><TableCell>Médecin</TableCell><TableCell>Date & Heure</TableCell><TableCell>Durée</TableCell><TableCell>Statut</TableCell><TableCell>Actions</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">Aucun rendez-vous</TableCell></TableRow>
                            ) : (
                                filteredAppointments.map((app) => (
                                    <TableRow key={app.id} hover>
                                        <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}><PersonIcon /></Avatar>{app.patient?.prenom} {app.patient?.nom}</Box></TableCell>
                                        <TableCell>Dr. {app.medecin?.prenom} {app.medecin?.nom}</TableCell>
                                        <TableCell><AccessTimeIcon sx={{ fontSize: 14 }} /> {app.date_heure ? new Date(app.date_heure).toLocaleString('fr-FR') : '-'}</TableCell>
                                        <TableCell><Chip label={`${app.duree || 20} min`} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{getStatusChip(app.statut)}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="info" onClick={() => { setSelectedAppointment(app); setOpenDetailsDialog(true); }}><DescriptionIcon /></IconButton>
                                            <IconButton size="small" color="primary" onClick={() => openEdit(app)}><EditIcon /></IconButton>
                                            {app.statut === 'en_attente' && <IconButton size="small" color="success" onClick={() => updateStatus(app.id, 'confirme')}><CheckCircleIcon /></IconButton>}
                                            {app.statut === 'confirme' && <IconButton size="small" color="error" onClick={() => updateStatus(app.id, 'annule')}><CancelIcon /></IconButton>}
                                            <IconButton size="small" color="error" onClick={() => handleDelete(app.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>➕ Nouveau rendez-vous</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Patient</InputLabel><Select value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} label="Patient">{patients.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Médecin</InputLabel><Select value={formData.medecin_id} onChange={(e) => setFormData({...formData, medecin_id: e.target.value})} label="Médecin">{doctors.map(d => <MenuItem key={d.id} value={d.id}>Dr. {d.prenom} {d.nom}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="time" label="Heure" value={formData.heure} onChange={(e) => setFormData({...formData, heure: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Durée (min)" value={formData.duree} onChange={(e) => setFormData({...formData, duree: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Motif" value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} multiline rows={2} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDialog(false)}>Annuler</Button><Button onClick={handleAddAppointment} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Ajouter</Button></DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={() => { setOpenEditDialog(false); resetForm(); }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>✏️ Modifier le rendez-vous</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Patient</InputLabel><Select value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} label="Patient">{patients.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><FormControl fullWidth><InputLabel>Médecin</InputLabel><Select value={formData.medecin_id} onChange={(e) => setFormData({...formData, medecin_id: e.target.value})} label="Médecin">{doctors.map(d => <MenuItem key={d.id} value={d.id}>Dr. {d.prenom} {d.nom}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="date" label="Date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="time" label="Heure" value={formData.heure} onChange={(e) => setFormData({...formData, heure: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth type="number" label="Durée (min)" value={formData.duree} onChange={(e) => setFormData({...formData, duree: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Motif" value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} multiline rows={2} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenEditDialog(false)}>Annuler</Button><Button onClick={handleEditAppointment} variant="contained" sx={{ bgcolor: '#1976d2' }}>Modifier</Button></DialogActions>
            </Dialog>

            <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>📄 Détails</DialogTitle>
                <DialogContent>
                    {selectedAppointment && (
                        <Box sx={{ p: 2 }}>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}><Typography><strong>Patient:</strong> {selectedAppointment.patient?.prenom} {selectedAppointment.patient?.nom}</Typography></Paper>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}><Typography><strong>Médecin:</strong> Dr. {selectedAppointment.medecin?.prenom} {selectedAppointment.medecin?.nom}</Typography></Paper>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}><Typography><strong>Date:</strong> {selectedAppointment.date_heure ? new Date(selectedAppointment.date_heure).toLocaleString('fr-FR') : '-'}</Typography></Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDetailsDialog(false)}>Fermer</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
        </Box>
    );
}

export default RendezVous;

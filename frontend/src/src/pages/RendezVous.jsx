import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    FormControl, InputLabel, Select, MenuItem, Alert, Snackbar,
    Card, CardContent, Tabs, Tab
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

function RendezVous() {
    const { searchTerm } = useOutletContext();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({ patient_id: '', medecin_id: '', date_heure: '', motif: '', duree_minutes: 20 });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setPatients([
            { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678' },
            { id: 2, nom: 'MARTIN', prenom: 'Jean', telephone: '0623456789' },
            { id: 3, nom: 'BERNARD', prenom: 'Sophie', telephone: '0634567890' },
        ]);
        setDoctors([
            { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue' },
            { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
            { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste' },
        ]);
        setAppointments([
            { id: 1, patient: { id: 1, nom: 'DUPONT', prenom: 'Marie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-15T10:00:00', statut: 'confirme', motif: 'Consultation' },
            { id: 2, patient: { id: 2, nom: 'MARTIN', prenom: 'Jean' }, medecin: { id: 1, nom: 'DUPONT', prenom: 'Jean' }, date_heure: '2024-01-15T14:30:00', statut: 'planifie', motif: 'Suivi cardiaque' },
            { id: 3, patient: { id: 3, nom: 'BERNARD', prenom: 'Sophie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2025-04-05T07:12:00', statut: 'planifie', motif: 'Urgence' },
        ]);
    };

    const handleSave = () => {
        const patient = patients.find(p => p.id === parseInt(formData.patient_id));
        const medecin = doctors.find(d => d.id === parseInt(formData.medecin_id));
        if (selectedAppointment) {
            setAppointments(appointments.map(a => a.id === selectedAppointment.id ? { ...formData, id: selectedAppointment.id, patient, medecin, statut: a.statut } : a));
        } else {
            setAppointments([...appointments, { ...formData, id: appointments.length + 1, patient, medecin, statut: 'planifie' }]);
        }
        setOpenDialog(false);
        setSnackbar({ open: true, message: 'Rendez-vous enregistré', severity: 'success' });
    };

    const updateStatus = (id, newStatus) => {
        setAppointments(appointments.map(a => a.id === id ? { ...a, statut: newStatus } : a));
        setSnackbar({ open: true, message: `Statut: ${newStatus}`, severity: 'success' });
    };

    const deleteAppointment = (id) => {
        if (window.confirm('Supprimer ce rendez-vous ?')) {
            setAppointments(appointments.filter(a => a.id !== id));
            setSnackbar({ open: true, message: 'Rendez-vous supprimé', severity: 'success' });
        }
    };

    const getStatusChip = (status) => {
        if (status === 'confirme') return <Chip icon={<CheckCircleIcon />} label="Confirmé" color="success" size="small" />;
        if (status === 'planifie') return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
        return <Chip icon={<CancelIcon />} label="Annulé" color="error" size="small" />;
    };

    const filteredAppointments = appointments.filter(a => 
        a.patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.medecin.nom.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(a => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return a.statut === 'planifie';
        if (tabValue === 2) return a.statut === 'confirme';
        return true;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Gestion des Rendez-vous</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedAppointment(null); setFormData({ patient_id: '', medecin_id: '', date_heure: '', motif: '' }); setOpenDialog(true); }} sx={{ bgcolor: '#00bcd4' }}>Prendre RDV</Button>
            </Box>

            <Paper sx={{ borderRadius: 3, mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab label="Tous" />
                    <Tab label="En attente" />
                    <Tab label="Confirmés" />
                </Tabs>
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow><TableCell>Patient</TableCell><TableCell>Médecin</TableCell><TableCell>Date & Heure</TableCell><TableCell>Motif</TableCell><TableCell>Statut</TableCell><TableCell>Actions</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments.map((app) => (
                                <TableRow key={app.id} hover>
                                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}><PersonIcon /></Avatar>{app.patient.prenom} {app.patient.nom}</Box></TableCell>
                                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}><LocalHospitalIcon /></Avatar>Dr. {app.medecin.prenom} {app.medecin.nom}</Box></TableCell>
                                    <TableCell><AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />{new Date(app.date_heure).toLocaleString('fr-FR')}</TableCell>
                                    <TableCell>{app.motif}</TableCell>
                                    <TableCell>{getStatusChip(app.statut)}</TableCell>
                                    <TableCell>
                                        {app.statut === 'planifie' && <IconButton size="small" color="success" onClick={() => updateStatus(app.id, 'confirme')}><CheckCircleIcon /></IconButton>}
                                        {app.statut === 'confirme' && <IconButton size="small" color="error" onClick={() => updateStatus(app.id, 'annule')}><CancelIcon /></IconButton>}
                                        <IconButton size="small" color="error" onClick={() => deleteAppointment(app.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nouveau Rendez-vous</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><FormControl fullWidth><InputLabel>Patient</InputLabel><Select value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: e.target.value})} label="Patient">{patients.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12}><FormControl fullWidth><InputLabel>Médecin</InputLabel><Select value={formData.medecin_id} onChange={(e) => setFormData({...formData, medecin_id: e.target.value})} label="Médecin">{doctors.map(d => <MenuItem key={d.id} value={d.id}>Dr. {d.prenom} {d.nom} - {d.specialite}</MenuItem>)}</Select></FormControl></Grid>
                        <Grid item xs={12}><TextField fullWidth type="datetime-local" label="Date & Heure" value={formData.date_heure} onChange={(e) => setFormData({...formData, date_heure: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Motif" value={formData.motif} onChange={(e) => setFormData({...formData, motif: e.target.value})} multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDialog(false)}>Annuler</Button><Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Prendre RDV</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
        </Box>
    );
}

export default RendezVous;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    FormControl, InputLabel, Select, MenuItem, Alert, Snackbar, CircularProgress,
    Tabs, Tab
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
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [localSearch, setLocalSearch] = useState('');
    const [formData, setFormData] = useState({
        id: '', patient_id: '', medecin_id: '', date: '', heure: '', duree: 20, motif: '', notes: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [rdvRes, medecinsRes, patientsRes] = await Promise.all([
                axios.get('http://localhost:3001/api/rendez-vous', { headers }),
                axios.get('http://localhost:3001/api/medecins', { headers }),
                axios.get('http://localhost:3001/api/patients', { headers })
            ]);
            
            setAppointments(rdvRes.data);
            setDoctors(medecinsRes.data);
            setPatients(patientsRes.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAppointment = async () => {
        if (!formData.patient_id || !formData.medecin_id || !formData.date || !formData.heure) {
            setSnackbar({ open: true, message: 'Tous les champs sont requis', severity: 'error' });
            return;
        }
        
        const dateHeure = `${formData.date}T${formData.heure}`;
        const dataToSend = {
            patient_id: formData.patient_id,
            medecin_id: formData.medecin_id,
            date_heure: dateHeure,
            duree: formData.duree,
            motif: formData.motif,
            notes: formData.notes
        };
        
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/api/rendez-vous', dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Rendez-vous ajouté', severity: 'success' });
            fetchAllData();
            setOpenDialog(false);
            resetForm();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur ajout', severity: 'error' });
        }
    };

    const handleEditAppointment = async () => {
        const dateHeure = `${formData.date}T${formData.heure}`;
        const dataToSend = {
            patient_id: formData.patient_id,
            medecin_id: formData.medecin_id,
            date_heure: dateHeure,
            duree: formData.duree,
            motif: formData.motif,
            notes: formData.notes
        };
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/rendez-vous/${formData.id}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Rendez-vous modifié', severity: 'success' });
            fetchAllData();
            setOpenEditDialog(false);
            resetForm();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur modification', severity: 'error' });
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3001/api/rendez-vous/${id}/status`, { statut: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: `Statut: ${newStatus}`, severity: 'success' });
            fetchAllData();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur', severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer ce rendez-vous ?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3001/api/rendez-vous/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Rendez-vous supprimé', severity: 'success' });
                fetchAllData();
            } catch (error) {
                setSnackbar({ open: true, message: 'Erreur suppression', severity: 'error' });
            }
        }
    };

    const openEdit = (appointment) => {
        setIsEditing(true);
        const date = appointment.date_heure ? appointment.date_heure.split('T')[0] : '';
        const heure = appointment.date_heure ? appointment.date_heure.split('T')[1]?.substring(0, 5) : '';
        
        setFormData({
            id: appointment.id,
            patient_id: appointment.patient_id || '',
            medecin_id: appointment.medecin_id || '',
            date: date,
            heure: heure,
            duree: appointment.duree || 20,
            motif: appointment.motif || '',
            notes: appointment.notes || ''
        });
        setOpenEditDialog(true);
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData({ id: '', patient_id: '', medecin_id: '', date: '', heure: '', duree: 20, motif: '', notes: '' });
    };

    const getStatusChip = (status) => {
        switch(status) {
            case 'confirme': return <Chip icon={<CheckCircleIcon />} label="Confirmé" color="success" size="small" />;
            case 'en_attente': return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
            case 'termine': return <Chip icon={<CheckCircleIcon />} label="Terminé" color="info" size="small" />;
            case 'annule': return <Chip icon={<CancelIcon />} label="Annulé" color="error" size="small" />;
            default: return <Chip label={status} size="small" />;
        }
    };

    const filteredAppointments = appointments.filter(a => {
        const search = localSearch.toLowerCase();
        return (a.patient_prenom?.toLowerCase() || '').includes(search) ||
               (a.patient_nom?.toLowerCase() || '').includes(search) ||
               (a.medecin_prenom?.toLowerCase() || '').includes(search) ||
               (a.medecin_nom?.toLowerCase() || '').includes(search);
    }).filter(a => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return a.statut === 'en_attente';
        if (tabValue === 2) return a.statut === 'confirme';
        if (tabValue === 3) return a.statut === 'termine';
        return true;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                📅 Gestion des Rendez-vous
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                <Paper sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 400 }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    <TextField 
                        fullWidth 
                        placeholder="Rechercher..." 
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
                    sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' }, px: 4, py: 1 }}
                >
                    + Ajouter
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 2, mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }}>
                    <Tab label="📋 Tous" />
                    <Tab label="⏳ En attente" />
                    <Tab label="✅ Confirmés" />
                    <Tab label="🏁 Terminés" />
                </Tabs>
            </Paper>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Médecin</TableCell>
                                <TableCell>Date & Heure</TableCell>
                                <TableCell>Durée</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments.map((app) => (
                                <TableRow key={app.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}><PersonIcon fontSize="small" /></Avatar>
                                            <Typography variant="body2">{app.patient_prenom} {app.patient_nom}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}><LocalHospitalIcon fontSize="small" /></Avatar>
                                            <Typography variant="body2">Dr. {app.medecin_prenom} {app.medecin_nom}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                        {app.date_heure ? new Date(app.date_heure).toLocaleString('fr-FR') : '-'}
                                    </TableCell>
                                    <TableCell><Chip label={`${app.duree || 20} min`} size="small" variant="outlined" /></TableCell>
                                    <TableCell>{getStatusChip(app.statut)}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="info" onClick={() => { setSelectedAppointment(app); setOpenDetailsDialog(true); }}><DescriptionIcon /></IconButton>
                                        <IconButton size="small" color="primary" onClick={() => openEdit(app)}><EditIcon /></IconButton>
                                        {app.statut === 'en_attente' && <IconButton size="small" color="success" onClick={() => updateStatus(app.id, 'confirme')}><CheckCircleIcon /></IconButton>}
                                        {app.statut === 'confirme' && <IconButton size="small" color="info" onClick={() => updateStatus(app.id, 'termine')}><CheckCircleIcon /></IconButton>}
                                        <IconButton size="small" color="error" onClick={() => handleDelete(app.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
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
                            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}><Typography><strong>Patient:</strong> {selectedAppointment.patient_prenom} {selectedAppointment.patient_nom}</Typography></Paper>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}><Typography><strong>Médecin:</strong> Dr. {selectedAppointment.medecin_prenom} {selectedAppointment.medecin_nom}</Typography></Paper>
                            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}><Typography><strong>Date:</strong> {selectedAppointment.date_heure ? new Date(selectedAppointment.date_heure).toLocaleString('fr-FR') : '-'}</Typography></Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDetailsDialog(false)}>Fermer</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default RendezVous;

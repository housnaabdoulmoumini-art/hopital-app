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
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [formData, setFormData] = useState({ id: '', nom: '', prenom: '', specialite: '', telephone: '', email: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchMedecins();
    }, []);

    const fetchMedecins = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/medecins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMedecin = async () => {
        if (!formData.nom || !formData.prenom || !formData.specialite) {
            setSnackbar({ open: true, message: 'Remplir tous les champs', severity: 'error' });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/api/medecins', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Médecin ajouté', severity: 'success' });
            fetchMedecins();
            setOpenDialog(false);
            resetForm();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur ajout', severity: 'error' });
        }
    };

    const handleEditMedecin = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/medecins/${formData.id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Médecin modifié', severity: 'success' });
            fetchMedecins();
            setOpenDialog(false);
            resetForm();
        } catch (error) {
            setSnackbar({ open: true, message: 'Erreur modification', severity: 'error' });
        }
    };

    const handleDeleteMedecin = async (id) => {
        if (window.confirm('Supprimer ce médecin ?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3001/api/medecins/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Médecin supprimé', severity: 'success' });
                fetchMedecins();
                if (selectedDoctor?.id === id) setSelectedDoctor(null);
            } catch (error) {
                setSnackbar({ open: true, message: 'Erreur suppression', severity: 'error' });
            }
        }
    };

    const openAddDialog = () => {
        setIsEditing(false);
        resetForm();
        setOpenDialog(true);
    };

    const openEditDialog = (doctor) => {
        setIsEditing(true);
        setFormData(doctor);
        setOpenDialog(true);
    };

    const resetForm = () => {
        setFormData({ id: '', nom: '', prenom: '', specialite: '', telephone: '', email: '' });
    };

    const getStatusIcon = (disponibilite) => {
        if (disponibilite === 'disponible') return <Chip icon={<CheckCircleIcon />} label="Disponible" color="success" size="small" />;
        if (disponibilite === 'occupe') return <Chip icon={<PendingIcon />} label="Occupé" color="warning" size="small" />;
        return <Chip icon={<CancelIcon />} label="Congés" color="error" size="small" />;
    };

    const filteredDoctors = doctors.filter(d =>
        d.nom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        d.prenom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        d.specialite?.toLowerCase().includes(localSearch.toLowerCase())
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                👨‍⚕️ Gestion des Médecins
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
                    onClick={openAddDialog}
                    sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' }, px: 4, py: 1 }}
                >
                    + Ajouter
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: '#00bcd4', color: 'white' }}>
                            <Typography variant="h6">📋 Liste ({filteredDoctors.length})</Typography>
                        </Box>
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
                                    {filteredDoctors.map((doctor) => (
                                        <TableRow key={doctor.id} hover selected={selectedDoctor?.id === doctor.id}>
                                            <TableCell onClick={() => setSelectedDoctor(doctor)}>
                                                <Chip label={doctor.numero_ordre || `0${doctor.id}`} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell onClick={() => setSelectedDoctor(doctor)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#00bcd4' }}>{doctor.prenom?.charAt(0)}</Avatar>
                                                    <Typography variant="body2">Dr. {doctor.prenom} {doctor.nom}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell onClick={() => setSelectedDoctor(doctor)}>
                                                <Chip label={doctor.specialite} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell onClick={() => setSelectedDoctor(doctor)}>
                                                {getStatusIcon(doctor.disponibilite)}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="info" onClick={() => openEditDialog(doctor)}><EditIcon /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteMedecin(doctor.id)}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                    {selectedDoctor ? (
                        <Paper sx={{ borderRadius: 3, p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: '#00bcd4', fontSize: 40 }}>
                                    {selectedDoctor.prenom?.charAt(0)}{selectedDoctor.nom?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</Typography>
                                    <Typography variant="body1" color="primary">{selectedDoctor.specialite}</Typography>
                                    <Typography variant="body2"><PhoneIcon sx={{ fontSize: 14 }} /> {selectedDoctor.telephone || '-'}</Typography>
                                    <Typography variant="body2"><EmailIcon sx={{ fontSize: 14 }} /> {selectedDoctor.email || '-'}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ) : (
                        <Paper sx={{ borderRadius: 3, p: 5, textAlign: 'center' }}>
                            <Typography color="text.secondary">👈 Cliquez sur un médecin</Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>
                    {isEditing ? '✏️ Modifier' : '➕ Ajouter un médecin'}
                </DialogTitle>
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
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={isEditing ? handleEditMedecin : handleAddMedecin} variant="contained" sx={{ bgcolor: '#00bcd4' }}>
                        {isEditing ? 'Modifier' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Medecins;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    Alert, Snackbar, TablePagination, CircularProgress, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localSearch, setLocalSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [formData, setFormData] = useState({
        id: '', nom: '', prenom: '', nss: '', date_naissance: '',
        email: '', telephone: '', adresse: '', groupe_sanguin: '', allergies: ''
    });

    const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Données mockées
    const mockPatients = [
        { id: 1, nom: 'DUPONT', prenom: 'Marie', nss: '123456789012345', date_naissance: '1985-03-15', telephone: '0612345678', email: 'marie@email.com', adresse: '12 rue de Paris', groupe_sanguin: 'A+', allergies: 'Aucune' },
        { id: 2, nom: 'MARTIN', prenom: 'Jean', nss: '234567890123456', date_naissance: '1990-07-22', telephone: '0623456789', email: 'jean@email.com', adresse: '15 avenue de la République', groupe_sanguin: 'O+', allergies: 'Pollen' },
        { id: 3, nom: 'BERNARD', prenom: 'Sophie', nss: '345678901234567', date_naissance: '1978-11-03', telephone: '0634567890', email: 'sophie@email.com', adresse: '8 rue des Lilas', groupe_sanguin: 'B-', allergies: 'Aucune' },
    ];

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('https://hopital-backend.onrender.com/api/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
        } catch (error) {
            console.log('Utilisation des données mockées');
            setPatients(mockPatients);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = () => {
        if (!formData.nom || !formData.prenom) {
            setSnackbar({ open: true, message: 'Nom et prénom requis', severity: 'error' });
            return;
        }
        const newPatient = { ...formData, id: patients.length + 1 };
        setPatients([...patients, newPatient]);
        setOpenDialog(false);
        resetForm();
        setSnackbar({ open: true, message: 'Patient ajouté', severity: 'success' });
    };

    const handleEditPatient = () => {
        setPatients(patients.map(p => p.id === formData.id ? formData : p));
        setOpenDialog(false);
        resetForm();
        setSnackbar({ open: true, message: 'Patient modifié', severity: 'success' });
    };

    const handleDeletePatient = (id) => {
        if (window.confirm('Supprimer ce patient ?')) {
            setPatients(patients.filter(p => p.id !== id));
            setSnackbar({ open: true, message: 'Patient supprimé', severity: 'success' });
        }
    };

    const openAddDialog = () => {
        setIsEditing(false);
        resetForm();
        setOpenDialog(true);
    };

    const openEditDialog = (patient) => {
        setIsEditing(true);
        setFormData(patient);
        setOpenDialog(true);
    };

    const resetForm = () => {
        setFormData({ id: '', nom: '', prenom: '', nss: '', date_naissance: '', email: '', telephone: '', adresse: '', groupe_sanguin: '', allergies: '' });
    };

    const filteredPatients = patients.filter(p =>
        p.nom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.prenom?.toLowerCase().includes(localSearch.toLowerCase()) ||
        p.telephone?.includes(localSearch)
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>👥 Gestion des Patients</Typography>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
                <Paper sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', flex: 1, maxWidth: 400 }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                    <TextField fullWidth placeholder="Rechercher..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} />
                </Paper>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog} sx={{ bgcolor: '#00bcd4', px: 4, py: 1 }}>
                    + Ajouter
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>NSS</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Groupe</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((patient) => (
                                <TableRow key={patient.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ bgcolor: '#1976d2' }}>{patient.prenom?.charAt(0)}{patient.nom?.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{patient.prenom} {patient.nom}</Typography>
                                                <Typography variant="caption" color="text.secondary">Né: {patient.date_naissance}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={patient.nss || '-'} size="small" variant="outlined" /></TableCell>
                                    <TableCell>
                                        <Typography variant="body2"><PhoneIcon sx={{ fontSize: 12 }} /> {patient.telephone || '-'}</Typography>
                                        <Typography variant="caption"><EmailIcon sx={{ fontSize: 10 }} /> {patient.email || '-'}</Typography>
                                    </TableCell>
                                    <TableCell><Chip label={patient.groupe_sanguin || '-'} size="small" color="primary" variant="outlined" /></TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="info" onClick={() => openEditDialog(patient)}><EditIcon /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDeletePatient(patient.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredPatients.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} />
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>
                    {isEditing ? '✏️ Modifier' : '➕ Ajouter un patient'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Prénom" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="NSS" value={formData.nss} onChange={(e) => setFormData({...formData, nss: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth type="date" label="Date naissance" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Adresse" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} multiline rows={2} /></Grid>
                        <Grid item xs={6}>
                            <TextField select fullWidth label="Groupe sanguin" value={formData.groupe_sanguin} onChange={(e) => setFormData({...formData, groupe_sanguin: e.target.value})}>
                                <MenuItem value="">Non renseigné</MenuItem>
                                {groupesSanguins.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Allergies" value={formData.allergies} onChange={(e) => setFormData({...formData, allergies: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={isEditing ? handleEditPatient : handleAddPatient} variant="contained" sx={{ bgcolor: '#00bcd4' }}>
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

export default Patients;

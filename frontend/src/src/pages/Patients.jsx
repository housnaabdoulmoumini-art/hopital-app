import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Grid, Chip, Avatar,
    Alert, Snackbar, InputAdornment, TablePagination
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function Patients() {
    const { searchTerm } = useOutletContext();
    const [patients, setPatients] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    const [formData, setFormData] = useState({
        nom: '', prenom: '', nss: '', date_naissance: '',
        email: '', telephone: '', adresse: '', groupe_sanguin: '', allergies: ''
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = () => {
        const mockPatients = [
            { id: 1, nom: 'DUPONT', prenom: 'Marie', nss: '123456789012345', date_naissance: '1985-03-15', telephone: '0612345678', email: 'marie.dupont@email.com', adresse: '12 rue de Paris', groupe_sanguin: 'A+', allergies: 'Aucune' },
            { id: 2, nom: 'MARTIN', prenom: 'Jean', nss: '234567890123456', date_naissance: '1990-07-22', telephone: '0623456789', email: 'jean.martin@email.com', adresse: '15 avenue de la République', groupe_sanguin: 'O+', allergies: 'Pollen' },
            { id: 3, nom: 'BERNARD', prenom: 'Sophie', nss: '345678901234567', date_naissance: '1978-11-03', telephone: '0634567890', email: 'sophie.bernard@email.com', adresse: '8 rue des Lilas', groupe_sanguin: 'B-', allergies: 'Aucune' },
            { id: 4, nom: 'PETIT', prenom: 'Pierre', nss: '456789012345678', date_naissance: '1995-01-28', telephone: '0645678901', email: 'pierre.petit@email.com', adresse: '23 boulevard Saint-Germain', groupe_sanguin: 'AB+', allergies: 'Arachides' },
            { id: 5, nom: 'ROBERT', prenom: 'Julie', nss: '567890123456789', date_naissance: '1982-09-17', telephone: '0656789012', email: 'julie.robert@email.com', adresse: '5 place de l\'Église', groupe_sanguin: 'A-', allergies: 'Aucune' },
        ];
        setPatients(mockPatients);
    };

    const handleSave = () => {
        if (selectedPatient) {
            setPatients(patients.map(p => p.id === selectedPatient.id ? { ...formData, id: selectedPatient.id } : p));
            setSnackbar({ open: true, message: 'Patient modifié avec succès', severity: 'success' });
        } else {
            const newPatient = { ...formData, id: patients.length + 1 };
            setPatients([...patients, newPatient]);
            setSnackbar({ open: true, message: 'Patient ajouté avec succès', severity: 'success' });
        }
        handleCloseDialog();
    };

    const handleDelete = (id) => {
        if (window.confirm('Supprimer ce patient ?')) {
            setPatients(patients.filter(p => p.id !== id));
            setSnackbar({ open: true, message: 'Patient supprimé', severity: 'success' });
        }
    };

    const handleOpenDialog = (patient = null) => {
        if (patient) {
            setSelectedPatient(patient);
            setFormData(patient);
        } else {
            setSelectedPatient(null);
            setFormData({ nom: '', prenom: '', nss: '', date_naissance: '', email: '', telephone: '', adresse: '', groupe_sanguin: '', allergies: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPatient(null);
    };

    const filteredPatients = patients.filter(p =>
        p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telephone.includes(searchTerm)
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Gestion des Patients</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' } }}>
                    Nouveau Patient
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>Nom & Prénom</TableCell>
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
                                            <Avatar sx={{ bgcolor: '#1976d2' }}>{patient.prenom.charAt(0)}{patient.nom.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{patient.prenom} {patient.nom}</Typography>
                                                <Typography variant="caption" color="text.secondary">Né le: {patient.date_naissance}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={patient.nss} size="small" variant="outlined" /></TableCell>
                                    <TableCell>
                                        <Typography variant="body2"><PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} /> {patient.telephone}</Typography>
                                        <Typography variant="caption" color="text.secondary"><EmailIcon sx={{ fontSize: 10, mr: 0.5 }} /> {patient.email}</Typography>
                                    </TableCell>
                                    <TableCell><Chip label={patient.groupe_sanguin} size="small" color="primary" variant="outlined" /></TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="info" onClick={() => handleOpenDialog(patient)}><EditIcon /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(patient.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredPatients.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value))} />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedPatient ? 'Modifier Patient' : 'Ajouter Patient'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Prénom" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="NSS" value={formData.nss} onChange={(e) => setFormData({...formData, nss: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth type="date" label="Date naissance" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Adresse" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} multiline rows={2} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Enregistrer</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Patients;

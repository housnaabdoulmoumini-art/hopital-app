import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Chip, Avatar, Alert, Snackbar,
    Card, CardContent, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function Medecins() {
    const { searchTerm } = useOutletContext();
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({ nom: '', prenom: '', specialite: '', telephone: '', email: '', numero_ordre: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setDoctors([
            { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue', telephone: '0612345678', email: 'jean.dupont@hopital.com', numero_ordre: '01', disponibilite: 'disponible' },
            { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre', telephone: '0623456789', email: 'sophie.lebrun@hopital.com', numero_ordre: '02', disponibilite: 'disponible' },
            { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste', telephone: '0634567890', email: 'pierre.martin@hopital.com', numero_ordre: '03', disponibilite: 'occupe' },
            { id: 4, nom: 'BERNARD', prenom: 'Marie', specialite: 'Dermatologue', telephone: '0645678901', email: 'marie.bernard@hopital.com', numero_ordre: '04', disponibilite: 'disponible' },
            { id: 5, nom: 'ROBERT', prenom: 'Thomas', specialite: 'Neurologue', telephone: '0656789012', email: 'thomas.robert@hopital.com', numero_ordre: '05', disponibilite: 'conges' },
            { id: 6, nom: 'RICHARD', prenom: 'Julie', specialite: 'Ophtalmologue', telephone: '0667890123', email: 'julie.richard@hopital.com', numero_ordre: '06', disponibilite: 'disponible' },
            { id: 7, nom: 'DURAND', prenom: 'Nicolas', specialite: 'Orthopédiste', telephone: '0678901234', email: 'nicolas.durand@hopital.com', numero_ordre: '07', disponibilite: 'disponible' },
            { id: 8, nom: 'DUBOIS', prenom: 'Claire', specialite: 'Psychiatre', telephone: '0689012345', email: 'claire.dubois@hopital.com', numero_ordre: '08', disponibilite: 'occupe' },
            { id: 9, nom: 'MOREAU', prenom: 'Lucas', specialite: 'Radiologue', telephone: '0690123456', email: 'lucas.moreau@hopital.com', numero_ordre: '09', disponibilite: 'disponible' },
            { id: 10, nom: 'SIMON', prenom: 'Laura', specialite: 'Anesthésiste', telephone: '0701234567', email: 'laura.simon@hopital.com', numero_ordre: '10', disponibilite: 'disponible' },
        ]);
        
        setAppointments([
            { id: 1, patient: { nom: 'DUPONT', prenom: 'Marie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-15T10:00:00', statut: 'confirme', motif: 'Consultation' },
            { id: 2, patient: { nom: 'MARTIN', prenom: 'Jean' }, medecin: { id: 1, nom: 'DUPONT', prenom: 'Jean' }, date_heure: '2024-01-15T14:30:00', statut: 'planifie', motif: 'Suivi' },
            { id: 3, patient: { nom: 'PETIT', prenom: 'Sophie' }, medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-16T09:00:00', statut: 'confirme', motif: 'Vaccination' },
        ]);
    };

    const handleSave = () => {
        if (selectedDoctor) {
            setDoctors(doctors.map(d => d.id === selectedDoctor.id ? { ...formData, id: selectedDoctor.id, numero_ordre: selectedDoctor.numero_ordre } : d));
        } else {
            setDoctors([...doctors, { ...formData, id: doctors.length + 1, numero_ordre: String(doctors.length + 1).padStart(2, '0') }]);
        }
        setOpenDialog(false);
        setSnackbar({ open: true, message: 'Médecin enregistré', severity: 'success' });
    };

    const getStatusIcon = (status) => {
        if (status === 'disponible') return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
        if (status === 'occupe') return <PendingIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
        return <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />;
    };

    const filteredDoctors = doctors.filter(d => 
        d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const doctorAppointments = appointments.filter(a => a.medecin.id === selectedDoctor?.id);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Gestion des Médecins</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedDoctor(null); setFormData({ nom: '', prenom: '', specialite: '', telephone: '', email: '' }); setOpenDialog(true); }} sx={{ bgcolor: '#00bcd4' }}>
                    Ajouter un médecin
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Colonne gauche - Liste des médecins */}
                <Grid item xs={12} md={5}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: '#00bcd4', color: 'white' }}>
                            <Typography variant="h6">Liste des médecins ({filteredDoctors.length})</Typography>
                        </Box>
                        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                            <Table stickyHeader>
                                <TableHead><TableRow><TableCell>N°</TableCell><TableCell>Nom & Prénom</TableCell><TableCell>Spécialité</TableCell><TableCell>Statut</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {filteredDoctors.map((doctor) => (
                                        <TableRow key={doctor.id} hover selected={selectedDoctor?.id === doctor.id} onClick={() => setSelectedDoctor(doctor)} sx={{ cursor: 'pointer' }}>
                                            <TableCell><Chip label={doctor.numero_ordre} size="small" color="primary" variant="outlined" /></TableCell>
                                            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Avatar sx={{ width: 32, height: 32, bgcolor: '#00bcd4' }}>{doctor.prenom.charAt(0)}</Avatar><Typography variant="body2" sx={{ fontWeight: 'medium' }}>Dr. {doctor.prenom} {doctor.nom}</Typography></Box></TableCell>
                                            <TableCell><Chip label={doctor.specialite} size="small" variant="outlined" /></TableCell>
                                            <TableCell>{getStatusIcon(doctor.disponibilite)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Colonne droite - Détails médecin + Rendez-vous */}
                <Grid item xs={12} md={7}>
                    {selectedDoctor ? (
                        <Paper sx={{ borderRadius: 3, p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: '#00bcd4', fontSize: 40 }}>{selectedDoctor.prenom.charAt(0)}{selectedDoctor.nom.charAt(0)}</Avatar>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</Typography>
                                    <Typography variant="body1" color="primary">{selectedDoctor.specialite}</Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                        <Typography variant="body2"><PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} /> {selectedDoctor.telephone}</Typography>
                                        <Typography variant="body2"><EmailIcon sx={{ fontSize: 14, mr: 0.5 }} /> {selectedDoctor.email}</Typography>
                                    </Box>
                                </Box>
                                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setFormData(selectedDoctor); setSelectedDoctor(selectedDoctor); setOpenDialog(true); }} sx={{ ml: 'auto' }}>Modifier</Button>
                            </Box>

                            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Rendez-vous de ce médecin</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead><TableRow><TableCell>Patient</TableCell><TableCell>Date & Heure</TableCell><TableCell>Motif</TableCell><TableCell>Statut</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {doctorAppointments.map((app) => (
                                            <TableRow key={app.id}>
                                                <TableCell>{app.patient.prenom} {app.patient.nom}</TableCell>
                                                <TableCell><AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} /> {new Date(app.date_heure).toLocaleString('fr-FR')}</TableCell>
                                                <TableCell>{app.motif}</TableCell>
                                                <TableCell><Chip label={app.statut} size="small" color={app.statut === 'confirme' ? 'success' : 'warning'} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    ) : (
                        <Paper sx={{ borderRadius: 3, p: 5, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">Sélectionnez un médecin pour voir ses détails</Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedDoctor ? 'Modifier Médecin' : 'Ajouter Médecin'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Prénom" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} /></Grid>
                        <Grid item xs={12}><FormControl fullWidth><InputLabel>Spécialité</InputLabel><Select value={formData.specialite} onChange={(e) => setFormData({...formData, specialite: e.target.value})} label="Spécialité"><MenuItem value="Cardiologue">Cardiologue</MenuItem><MenuItem value="Pédiatre">Pédiatre</MenuItem><MenuItem value="Généraliste">Généraliste</MenuItem><MenuItem value="Dermatologue">Dermatologue</MenuItem><MenuItem value="Neurologue">Neurologue</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenDialog(false)}>Annuler</Button><Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Enregistrer</Button></DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
        </Box>
    );
}

export default Medecins;

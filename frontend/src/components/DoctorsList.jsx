import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Box, IconButton, AppBar, Toolbar,
    Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent,
    Tabs, Tab, Badge, Alert, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

function DoctorsList() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Formulaire médecin
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        specialite: '',
        telephone: '',
        email: '',
        adresse: '',
        numero_ordre: '',
        disponibilite: 'disponible',
        consultation_duree: 20,
        consultation_prix: 0
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('import.meta.env.VITE_API_URL/api/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(response.data);
        } catch (error) {
            // Données mockées pour l'affichage
            const mockDoctors = [
                { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue', telephone: '0612345678', email: 'jean.dupont@hopital.com', numero_ordre: '01', disponibilite: 'disponible', consultation_duree: 20 },
                { id: 2, nom: 'MARTIN', prenom: 'Sophie', specialite: 'Pédiatre', telephone: '0623456789', email: 'sophie.martin@hopital.com', numero_ordre: '02', disponibilite: 'disponible', consultation_duree: 25 },
                { id: 3, nom: 'BERNARD', prenom: 'Pierre', specialite: 'Généraliste', telephone: '0634567890', email: 'pierre.bernard@hopital.com', numero_ordre: '03', disponibilite: 'occupe', consultation_duree: 15 },
                { id: 4, nom: 'PETIT', prenom: 'Marie', specialite: 'Dermatologue', telephone: '0645678901', email: 'marie.petit@hopital.com', numero_ordre: '04', disponibilite: 'disponible', consultation_duree: 20 },
                { id: 5, nom: 'ROBERT', prenom: 'Thomas', specialite: 'Neurologue', telephone: '0656789012', email: 'thomas.robert@hopital.com', numero_ordre: '05', disponibilite: 'conges', consultation_duree: 30 },
                { id: 6, nom: 'RICHARD', prenom: 'Julie', specialite: 'Ophtalmologue', telephone: '0667890123', email: 'julie.richard@hopital.com', numero_ordre: '06', disponibilite: 'disponible', consultation_duree: 20 },
                { id: 7, nom: 'DURAND', prenom: 'Nicolas', specialite: 'Orthopédiste', telephone: '0678901234', email: 'nicolas.durand@hopital.com', numero_ordre: '07', disponibilite: 'disponible', consultation_duree: 25 },
                { id: 8, nom: 'DUBOIS', prenom: 'Claire', specialite: 'Psychiatre', telephone: '0689012345', email: 'claire.dubois@hopital.com', numero_ordre: '08', disponibilite: 'occupe', consultation_duree: 30 },
                { id: 9, nom: 'MOREAU', prenom: 'Lucas', specialite: 'Radiologue', telephone: '0690123456', email: 'lucas.moreau@hopital.com', numero_ordre: '09', disponibilite: 'disponible', consultation_duree: 20 },
                { id: 10, nom: 'SIMON', prenom: 'Laura', specialite: 'Anesthésiste', telephone: '0701234567', email: 'laura.simon@hopital.com', numero_ordre: '10', disponibilite: 'disponible', consultation_duree: 20 }
            ];
            setDoctors(mockDoctors);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (selectedDoctor) {
                await axios.put(`import.meta.env.VITE_API_URL/api/doctors/${selectedDoctor.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Médecin modifié avec succès', severity: 'success' });
            } else {
                await axios.post('import.meta.env.VITE_API_URL/api/doctors', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Médecin ajouté avec succès', severity: 'success' });
            }
            handleCloseDialog();
            fetchDoctors();
        } catch (error) {
            // Mode démo - ajout local
            const newDoctor = { ...formData, id: doctors.length + 1 };
            if (selectedDoctor) {
                const index = doctors.findIndex(d => d.id === selectedDoctor.id);
                doctors[index] = { ...doctors[index], ...formData };
                setDoctors([...doctors]);
            } else {
                setDoctors([...doctors, newDoctor]);
            }
            setSnackbar({ open: true, message: 'Médecin enregistré (mode démo)', severity: 'success' });
            handleCloseDialog();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`import.meta.env.VITE_API_URL/api/doctors/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ open: true, message: 'Médecin supprimé', severity: 'success' });
                fetchDoctors();
            } catch (error) {
                // Mode démo - suppression locale
                setDoctors(doctors.filter(d => d.id !== id));
                setSnackbar({ open: true, message: 'Médecin supprimé (mode démo)', severity: 'info' });
            }
        }
    };

    const handleOpenDialog = (doctor = null) => {
        if (doctor) {
            setSelectedDoctor(doctor);
            setFormData(doctor);
        } else {
            setSelectedDoctor(null);
            setFormData({
                nom: '',
                prenom: '',
                specialite: '',
                telephone: '',
                email: '',
                adresse: '',
                numero_ordre: '',
                disponibilite: 'disponible',
                consultation_duree: 20,
                consultation_prix: 0
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedDoctor(null);
    };

    const getDisponibiliteColor = (statut) => {
        switch(statut) {
            case 'disponible': return 'success';
            case 'occupe': return 'warning';
            case 'conges': return 'error';
            default: return 'default';
        }
    };

    const getDisponibiliteText = (statut) => {
        switch(statut) {
            case 'disponible': return 'Disponible';
            case 'occupe': return 'En consultation';
            case 'conges': return 'En congés';
            default: return statut;
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.nom.toLowerCase().includes(search.toLowerCase()) ||
        doctor.prenom.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialite.toLowerCase().includes(search.toLowerCase()) ||
        doctor.numero_ordre.includes(search)
    );

    const specialites = [...new Set(doctors.map(d => d.specialite))];

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <LocalHospitalIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Liste des Médecins ({doctors.length})
                    </Typography>
                    <Button 
                        color="inherit" 
                        onClick={() => handleOpenDialog()}
                        startIcon={<AddIcon />}
                    >
                        Nouveau Médecin
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Barre de recherche et filtres */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="Rechercher par nom, prénom, spécialité ou numéro d'ordre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Tabs 
                                value={tabValue} 
                                onChange={(e, v) => setTabValue(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="Tous" />
                                <Tab label="Disponibles" />
                                <Tab label="En consultation" />
                                <Tab label="En congés" />
                            </Tabs>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Tableau des médecins comme dans l'image */}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>N°</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nom & Prénom</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Spécialité</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredDoctors
                                .filter(doctor => {
                                    if (tabValue === 0) return true;
                                    if (tabValue === 1) return doctor.disponibilite === 'disponible';
                                    if (tabValue === 2) return doctor.disponibilite === 'occupe';
                                    if (tabValue === 3) return doctor.disponibilite === 'conges';
                                    return true;
                                })
                                .map((doctor, index) => (
                                    <TableRow key={doctor.id} hover>
                                        <TableCell>
                                            <Chip 
                                                label={doctor.numero_ordre || `0${doctor.id}`} 
                                                size="small" 
                                                color="primary" 
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                                                    {doctor.prenom?.charAt(0)}{doctor.nom?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                        Dr. {doctor.prenom} {doctor.nom}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Ordre: {doctor.numero_ordre || `00${doctor.id}`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={doctor.specialite} 
                                                size="small" 
                                                sx={{ backgroundColor: '#e3f2fd' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PhoneIcon sx={{ fontSize: 14 }} /> {doctor.telephone}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <EmailIcon sx={{ fontSize: 12 }} /> {doctor.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={getDisponibiliteText(doctor.disponibilite)}
                                                color={getDisponibiliteColor(doctor.disponibilite)}
                                                size="small"
                                                icon={doctor.disponibilite === 'disponible' ? <CheckCircleIcon /> : <ScheduleIcon />}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton 
                                                size="small" 
                                                color="primary"
                                                onClick={() => navigate(`/doctors/${doctor.id}/schedule`)}
                                                title="Voir agenda"
                                            >
                                                <ScheduleIcon />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="info"
                                                onClick={() => handleOpenDialog(doctor)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="error"
                                                onClick={() => handleDelete(doctor.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Statistiques */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">{doctors.length}</Typography>
                                <Typography variant="body2" color="text.secondary">Total Médecins</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">
                                    {doctors.filter(d => d.disponibilite === 'disponible').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">Disponibles</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main">
                                    {doctors.filter(d => d.disponibilite === 'occupe').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">En consultation</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="error.main">
                                    {doctors.filter(d => d.disponibilite === 'conges').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">En congés</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Dialog Ajout/Modification Médecin */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {selectedDoctor ? 'Modifier le Médecin' : 'Ajouter un Nouveau Médecin'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    value={formData.nom}
                                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    value={formData.prenom}
                                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Numéro d'ordre"
                                    value={formData.numero_ordre}
                                    onChange={(e) => setFormData({...formData, numero_ordre: e.target.value})}
                                    placeholder="01, 02, 03..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Spécialité</InputLabel>
                                    <Select
                                        value={formData.specialite}
                                        onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                                        label="Spécialité"
                                    >
                                        <MenuItem value="Généraliste">Généraliste</MenuItem>
                                        <MenuItem value="Cardiologue">Cardiologue</MenuItem>
                                        <MenuItem value="Pédiatre">Pédiatre</MenuItem>
                                        <MenuItem value="Dermatologue">Dermatologue</MenuItem>
                                        <MenuItem value="Neurologue">Neurologue</MenuItem>
                                        <MenuItem value="Ophtalmologue">Ophtalmologue</MenuItem>
                                        <MenuItem value="Orthopédiste">Orthopédiste</MenuItem>
                                        <MenuItem value="Psychiatre">Psychiatre</MenuItem>
                                        <MenuItem value="Radiologue">Radiologue</MenuItem>
                                        <MenuItem value="Anesthésiste">Anesthésiste</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Adresse"
                                    value={formData.adresse}
                                    onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Disponibilité</InputLabel>
                                    <Select
                                        value={formData.disponibilite}
                                        onChange={(e) => setFormData({...formData, disponibilite: e.target.value})}
                                        label="Disponibilité"
                                    >
                                        <MenuItem value="disponible">Disponible</MenuItem>
                                        <MenuItem value="occupe">En consultation</MenuItem>
                                        <MenuItem value="conges">En congés</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Durée consultation (minutes)"
                                    value={formData.consultation_duree}
                                    onChange={(e) => setFormData({...formData, consultation_duree: parseInt(e.target.value)})}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Annuler</Button>
                        <Button onClick={handleSave} variant="contained" color="primary">
                            {selectedDoctor ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
}

export default DoctorsList;

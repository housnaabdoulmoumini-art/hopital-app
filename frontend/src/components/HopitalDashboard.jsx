import React, { useState, useEffect } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, Typography, IconButton, 
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Container, Grid, Paper, TextField, Button, Chip, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, InputAdornment, Badge, Menu, MenuItem,
    Divider, Tabs, Tab, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, Alert, Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';

const drawerWidth = 280;

function HopitalDashboard() {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('rendez-vous');
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [openAddDoctor, setOpenAddDoctor] = useState(false);
    const [openAddAppointment, setOpenAddAppointment] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Données
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    
    // Formulaires
    const [doctorForm, setDoctorForm] = useState({
        nom: '', prenom: '', specialite: '', telephone: '', email: '', numero_ordre: ''
    });
    
    const [appointmentForm, setAppointmentForm] = useState({
        patient_id: '', medecin_id: '', date_heure: '', motif: '', duree_minutes: 20
    });

    // Menu items
    const menuItems = [
        { text: 'Accueil', icon: <HomeIcon />, value: 'accueil' },
        { text: 'Patients', icon: <PeopleIcon />, value: 'patients' },
        { text: 'Rendez-vous', icon: <CalendarTodayIcon />, value: 'rendez-vous' },
        { text: 'Médecins', icon: <LocalHospitalIcon />, value: 'medecins' },
        { text: 'Stats', icon: <BarChartIcon />, value: 'stats' },
        { text: 'Paramètres', icon: <SettingsIcon />, value: 'parametres' },
    ];

    useEffect(() => {
        loadMockData();
    }, []);

    const loadMockData = () => {
        // Médecins avec numéros 01-10
        setDoctors([
            { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue', telephone: '0612345678', email: 'jean.dupont@hopital.com', numero_ordre: '01', disponibilite: 'disponible' },
            { id: 2, nom: 'MARTIN', prenom: 'Sophie', specialite: 'Pédiatre', telephone: '0623456789', email: 'sophie.martin@hopital.com', numero_ordre: '02', disponibilite: 'disponible' },
            { id: 3, nom: 'BERNARD', prenom: 'Pierre', specialite: 'Généraliste', telephone: '0634567890', email: 'pierre.bernard@hopital.com', numero_ordre: '03', disponibilite: 'occupe' },
            { id: 4, nom: 'PETIT', prenom: 'Marie', specialite: 'Dermatologue', telephone: '0645678901', email: 'marie.petit@hopital.com', numero_ordre: '04', disponibilite: 'disponible' },
            { id: 5, nom: 'ROBERT', prenom: 'Thomas', specialite: 'Neurologue', telephone: '0656789012', email: 'thomas.robert@hopital.com', numero_ordre: '05', disponibilite: 'conges' },
            { id: 6, nom: 'RICHARD', prenom: 'Julie', specialite: 'Ophtalmologue', telephone: '0667890123', email: 'julie.richard@hopital.com', numero_ordre: '06', disponibilite: 'disponible' },
            { id: 7, nom: 'DURAND', prenom: 'Nicolas', specialite: 'Orthopédiste', telephone: '0678901234', email: 'nicolas.durand@hopital.com', numero_ordre: '07', disponibilite: 'disponible' },
            { id: 8, nom: 'DUBOIS', prenom: 'Claire', specialite: 'Psychiatre', telephone: '0689012345', email: 'claire.dubois@hopital.com', numero_ordre: '08', disponibilite: 'occupe' },
            { id: 9, nom: 'MOREAU', prenom: 'Lucas', specialite: 'Radiologue', telephone: '0690123456', email: 'lucas.moreau@hopital.com', numero_ordre: '09', disponibilite: 'disponible' },
            { id: 10, nom: 'SIMON', prenom: 'Laura', specialite: 'Anesthésiste', telephone: '0701234567', email: 'laura.simon@hopital.com', numero_ordre: '10', disponibilite: 'disponible' }
        ]);
        
        // Patients
        setPatients([
            { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678', email: 'marie@email.com' },
            { id: 2, nom: 'LEBRUN', prenom: 'Sophie', telephone: '0623456789', email: 'sophie@email.com' },
            { id: 3, nom: 'MARTIN', prenom: 'Jean', telephone: '0634567890', email: 'jean@email.com' },
        ]);
        
        // Rendez-vous
        setAppointments([
            { id: 1, patient: { nom: 'DUPONT', prenom: 'Marie' }, medecin: { nom: 'LEBRUN', prenom: 'Sophie' }, date_heure: '2024-01-15T10:00:00', statut: 'confirme', motif: 'Consultation' },
            { id: 2, patient: { nom: 'MARTIN', prenom: 'Jean' }, medecin: { nom: 'DUPONT', prenom: 'Jean' }, date_heure: '2024-01-15T14:30:00', statut: 'planifie', motif: 'Suivi' },
            { id: 3, patient: { nom: 'DUPONT', prenom: 'Marie' }, medecin: { nom: 'BERNARD', prenom: 'Pierre' }, date_heure: '2025-04-05T07:12:00', statut: 'planifie', motif: 'Urgence' }
        ]);
    };

    const handleAddDoctor = () => {
        const newDoctor = {
            id: doctors.length + 1,
            ...doctorForm,
            numero_ordre: String(doctors.length + 1).padStart(2, '0')
        };
        setDoctors([...doctors, newDoctor]);
        setOpenAddDoctor(false);
        setDoctorForm({ nom: '', prenom: '', specialite: '', telephone: '', email: '', numero_ordre: '' });
        setSnackbar({ open: true, message: 'Médecin ajouté avec succès', severity: 'success' });
    };

    const handleAddAppointment = () => {
        const patient = patients.find(p => p.id === parseInt(appointmentForm.patient_id));
        const medecin = doctors.find(d => d.id === parseInt(appointmentForm.medecin_id));
        const newAppointment = {
            id: appointments.length + 1,
            patient: { nom: patient?.nom, prenom: patient?.prenom },
            medecin: { nom: medecin?.nom, prenom: medecin?.prenom },
            date_heure: appointmentForm.date_heure,
            statut: 'planifie',
            motif: appointmentForm.motif
        };
        setAppointments([...appointments, newAppointment]);
        setOpenAddAppointment(false);
        setAppointmentForm({ patient_id: '', medecin_id: '', date_heure: '', motif: '', duree_minutes: 20 });
        setSnackbar({ open: true, message: 'Rendez-vous ajouté', severity: 'success' });
    };

    const updateAppointmentStatus = (id, newStatus) => {
        setAppointments(appointments.map(app => 
            app.id === id ? { ...app, statut: newStatus } : app
        ));
        setSnackbar({ open: true, message: `Statut mis à jour: ${newStatus}`, severity: 'success' });
    };

    const deleteAppointment = (id) => {
        setAppointments(appointments.filter(app => app.id !== id));
        setSnackbar({ open: true, message: 'Rendez-vous supprimé', severity: 'success' });
    };

    const getStatusChip = (status) => {
        switch(status) {
            case 'planifie': return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
            case 'confirme': return <Chip icon={<CheckCircleIcon />} label="Confirmé" color="success" size="small" />;
            case 'termine': return <Chip icon={<CheckCircleIcon />} label="Terminé" color="info" size="small" />;
            case 'annule': return <Chip icon={<CancelIcon />} label="Annulé" color="error" size="small" />;
            default: return <Chip label={status} size="small" />;
        }
    };

    const formatDateTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredDoctors = doctors.filter(d => 
        d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialite.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAppointments = appointments.filter(app =>
        app.patient.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.patient.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.medecin.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a2e', color: 'white' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon sx={{ color: '#00bcd4' }} />
                    HOPITAL V6
                </Typography>
                <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
                    Gestion Hospitalière
                </Typography>
            </Box>
            
            <List sx={{ flex: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            selected={selectedMenu === item.value}
                            onClick={() => setSelectedMenu(item.value)}
                            sx={{
                                mx: 1, borderRadius: 2, mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: '#00bcd4',
                                    '&:hover': { backgroundColor: '#00acc1' }
                                },
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <ListItemIcon sx={{ color: selectedMenu === item.value ? 'white' : '#888', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                primaryTypographyProps={{ 
                                    fontSize: '0.9rem',
                                    fontWeight: selectedMenu === item.value ? 'bold' : 'normal'
                                }}
                            />
                            {item.text === 'Rendez-vous' && appointments.length > 0 && (
                                <Badge badgeContent={appointments.filter(a => a.statut === 'planifie').length} color="error" />
                            )}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', textAlign: 'center' }}>
                    © 2024 HOPITAL V6
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* Menu latéral */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Contenu principal */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                {/* Top Bar */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button size="small" startIcon={<AccountCircleIcon />}>Account</Button>
                                <Button size="small" startIcon={<FamilyRestroomIcon />}>Parents</Button>
                                <Button size="small" startIcon={<MedicalServicesIcon />}>Mediacentra</Button>
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    startIcon={<AddIcon />}
                                    onClick={() => setOpenAddDoctor(true)}
                                    sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' } }}
                                >
                                    Ajouter un médecin
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Vue principale avec deux colonnes */}
                <Grid container spacing={3}>
                    {/* Colonne gauche - Liste des Médecins */}
                    <Grid item xs={12} md={5}>
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, bgcolor: '#00bcd4', color: 'white' }}>
                                <Typography variant="h6">Liste des médecins ({filteredDoctors.length})</Typography>
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>N°</TableCell>
                                            <TableCell>Nom & Prénom</TableCell>
                                            <TableCell>Spécialité</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredDoctors.map((doctor, idx) => (
                                            <TableRow 
                                                key={doctor.id} 
                                                hover 
                                                selected={selectedDoctor?.id === doctor.id}
                                                onClick={() => setSelectedDoctor(doctor)}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>
                                                    <Chip 
                                                        label={doctor.numero_ordre} 
                                                        size="small" 
                                                        color="primary" 
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#00bcd4' }}>
                                                            {doctor.prenom.charAt(0)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                Dr. {doctor.prenom} {doctor.nom}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {doctor.specialite}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={doctor.specialite} size="small" variant="outlined" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Colonne droite - Liste des Rendez-vous */}
                    <Grid item xs={12} md={7}>
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Liste des rendez-vous ({filteredAppointments.length})</Typography>
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    startIcon={<AddIcon />}
                                    onClick={() => setOpenAddAppointment(true)}
                                    sx={{ bgcolor: 'white', color: '#1976d2', '&:hover': { bgcolor: '#f5f5f5' } }}
                                >
                                    Nouveau RDV
                                </Button>
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Patient</TableCell>
                                            <TableCell>Médecin</TableCell>
                                            <TableCell>Date & Heure</TableCell>
                                            <TableCell>Statut</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredAppointments.map((appointment) => (
                                            <TableRow key={appointment.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                                                            {appointment.patient.prenom.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {appointment.patient.prenom} {appointment.patient.nom}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        Dr. {appointment.medecin.prenom} {appointment.medecin.nom}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AccessTimeIcon sx={{ fontSize: 14, color: 'action.active' }} />
                                                        <Typography variant="body2">
                                                            {formatDateTime(appointment.date_heure)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(appointment.statut)}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton 
                                                        size="small" 
                                                        color="success"
                                                        onClick={() => updateAppointmentStatus(appointment.id, 'confirme')}
                                                        title="Confirmer"
                                                    >
                                                        <CheckCircleIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error"
                                                        onClick={() => updateAppointmentStatus(appointment.id, 'annule')}
                                                        title="Annuler"
                                                    >
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="default"
                                                        onClick={() => deleteAppointment(appointment.id)}
                                                        title="Supprimer"
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Dialog Ajouter Médecin */}
                <Dialog open={openAddDoctor} onClose={() => setOpenAddDoctor(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Ajouter un médecin</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Nom" value={doctorForm.nom} onChange={(e) => setDoctorForm({...doctorForm, nom: e.target.value})} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Prénom" value={doctorForm.prenom} onChange={(e) => setDoctorForm({...doctorForm, prenom: e.target.value})} />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Spécialité</InputLabel>
                                    <Select value={doctorForm.specialite} onChange={(e) => setDoctorForm({...doctorForm, specialite: e.target.value})} label="Spécialité">
                                        <MenuItem value="Généraliste">Généraliste</MenuItem>
                                        <MenuItem value="Cardiologue">Cardiologue</MenuItem>
                                        <MenuItem value="Pédiatre">Pédiatre</MenuItem>
                                        <MenuItem value="Dermatologue">Dermatologue</MenuItem>
                                        <MenuItem value="Neurologue">Neurologue</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Téléphone" value={doctorForm.telephone} onChange={(e) => setDoctorForm({...doctorForm, telephone: e.target.value})} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddDoctor(false)}>Annuler</Button>
                        <Button onClick={handleAddDoctor} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Ajouter</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Ajouter Rendez-vous */}
                <Dialog open={openAddAppointment} onClose={() => setOpenAddAppointment(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Prendre un rendez-vous</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Patient</InputLabel>
                                    <Select value={appointmentForm.patient_id} onChange={(e) => setAppointmentForm({...appointmentForm, patient_id: e.target.value})} label="Patient">
                                        {patients.map(p => <MenuItem key={p.id} value={p.id}>{p.prenom} {p.nom}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Médecin</InputLabel>
                                    <Select value={appointmentForm.medecin_id} onChange={(e) => setAppointmentForm({...appointmentForm, medecin_id: e.target.value})} label="Médecin">
                                        {doctors.map(d => <MenuItem key={d.id} value={d.id}>Dr. {d.prenom} {d.nom} - {d.specialite}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth type="datetime-local" label="Date & Heure" value={appointmentForm.date_heure} onChange={(e) => setAppointmentForm({...appointmentForm, date_heure: e.target.value})} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Motif" value={appointmentForm.motif} onChange={(e) => setAppointmentForm({...appointmentForm, motif: e.target.value})} />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddAppointment(false)}>Annuler</Button>
                        <Button onClick={handleAddAppointment} variant="contained" color="primary">Prendre RDV</Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}

export default HopitalDashboard;

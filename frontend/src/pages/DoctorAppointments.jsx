import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, Chip, Avatar, IconButton, Snackbar, Alert,
    Card, CardContent, Grid, Tabs, Tab, Badge, Divider
} from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

function DoctorAppointments() {
    const { searchTerm } = useOutletContext();
    const [appointments, setAppointments] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);

    // Docteur connecté (simulation)
    const currentDoctor = {
        id: 2,
        nom: 'LEBRUN',
        prenom: 'Sophie',
        specialite: 'Pédiatre',
        telephone: '0623456789',
        email: 'sophie.lebrun@hopital.com'
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = () => {
        // Demandes de rendez-vous des patients
        const mockAppointments = [
            {
                id: 1,
                patient: { id: 1, nom: 'DUPONT', prenom: 'Marie', telephone: '0612345678', email: 'marie@email.com', nss: '123456789012345' },
                medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
                date_heure: '2024-01-20T10:00:00',
                motif: 'Vaccination enfant',
                statut: 'en_attente',
                date_demande: '2024-01-15T08:30:00',
                notes: 'Premier vaccin pour mon fils de 2 mois'
            },
            {
                id: 2,
                patient: { id: 2, nom: 'MARTIN', prenom: 'Jean', telephone: '0623456789', email: 'jean@email.com', nss: '234567890123456' },
                medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
                date_heure: '2024-01-20T14:30:00',
                motif: 'Consultation pédiatrique',
                statut: 'en_attente',
                date_demande: '2024-01-14T15:20:00',
                notes: 'Mon fils a de la fièvre depuis 2 jours'
            },
            {
                id: 3,
                patient: { id: 3, nom: 'BERNARD', prenom: 'Sophie', telephone: '0634567890', email: 'sophie@email.com', nss: '345678901234567' },
                medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
                date_heure: '2024-01-21T09:00:00',
                motif: 'Contrôle routine',
                statut: 'confirme',
                date_demande: '2024-01-10T10:00:00',
                notes: 'Contrôle annuel'
            },
            {
                id: 4,
                patient: { id: 4, nom: 'PETIT', prenom: 'Pierre', telephone: '0645678901', email: 'pierre@email.com', nss: '456789012345678' },
                medecin: { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre' },
                date_heure: '2024-01-22T11:00:00',
                motif: 'Urgence',
                statut: 'en_attente',
                date_demande: '2024-01-16T07:45:00',
                notes: 'Mon enfant a une forte fièvre et des vomissements'
            }
        ];
        setAppointments(mockAppointments);
    };

    const confirmAppointment = (id) => {
        setAppointments(appointments.map(app => 
            app.id === id ? { ...app, statut: 'confirme' } : app
        ));
        
        const appointment = appointments.find(a => a.id === id);
        setSnackbar({ 
            open: true, 
            message: `Rendez-vous confirmé pour ${appointment.patient.prenom} ${appointment.patient.nom}`, 
            severity: 'success' 
        });
        
        // Simulation d'envoi de notification au patient
        console.log(`📧 Email envoyé à ${appointment.patient.email}: Votre rendez-vous est confirmé`);
        console.log(`📱 SMS envoyé à ${appointment.patient.telephone}: RDV confirmé le ${new Date(appointment.date_heure).toLocaleString('fr-FR')}`);
    };

    const rejectAppointment = (id) => {
        setAppointments(appointments.map(app => 
            app.id === id ? { ...app, statut: 'rejete' } : app
        ));
        
        const appointment = appointments.find(a => a.id === id);
        setSnackbar({ 
            open: true, 
            message: `Rendez-vous refusé pour ${appointment.patient.prenom} ${appointment.patient.nom}`, 
            severity: 'warning' 
        });
    };

    const putOnHold = (id) => {
        setAppointments(appointments.map(app => 
            app.id === id ? { ...app, statut: 'en_attente' } : app
        ));
        setSnackbar({ open: true, message: 'Rendez-vous mis en attente', severity: 'info' });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'en_attente':
                return <Chip icon={<PendingIcon />} label="En attente" color="warning" size="small" />;
            case 'confirme':
                return <Chip icon={<CheckCircleIcon />} label="Confirmé" color="success" size="small" />;
            case 'rejete':
                return <Chip icon={<CancelIcon />} label="Refusé" color="error" size="small" />;
            default:
                return <Chip label={status} size="small" />;
        }
    };

    const filteredAppointments = appointments.filter(app => {
        if (tabValue === 0) return app.statut === 'en_attente';
        if (tabValue === 1) return app.statut === 'confirme';
        if (tabValue === 2) return app.statut === 'rejete';
        return true;
    });

    const stats = {
        enAttente: appointments.filter(a => a.statut === 'en_attente').length,
        confirmes: appointments.filter(a => a.statut === 'confirme').length,
        total: appointments.length
    };

    return (
        <Box>
            {/* En-tête avec infos médecin */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1976d2', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Avatar sx={{ width: 70, height: 70, bgcolor: 'white', color: '#1976d2', fontSize: 30 }}>
                        <LocalHospitalIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Dr. {currentDoctor.prenom} {currentDoctor.nom}
                        </Typography>
                        <Typography variant="body1">{currentDoctor.specialite}</Typography>
                        <Typography variant="body2"><PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} /> {currentDoctor.telephone}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                        <Badge badgeContent={stats.enAttente} color="warning" sx={{ mr: 2 }}>
                            <Typography variant="body2">En attente</Typography>
                        </Badge>
                        <Badge badgeContent={stats.confirmes} color="success">
                            <Typography variant="body2">Confirmés</Typography>
                        </Badge>
                    </Box>
                </Box>
            </Paper>

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setTabValue(0)}>
                        <CardContent>
                            <PendingIcon sx={{ fontSize: 40, color: '#ff9800' }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ff9800' }}>{stats.enAttente}</Typography>
                            <Typography variant="body2">Demandes en attente</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => setTabValue(1)}>
                        <CardContent>
                            <CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{stats.confirmes}</Typography>
                            <Typography variant="body2">Rendez-vous confirmés</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
                        <CardContent>
                            <CalendarTodayIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1976d2' }}>{stats.total}</Typography>
                            <Typography variant="body2">Total demandes</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ borderRadius: 3, mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }}>
                    <Tab label="📋 En attente" />
                    <Tab label="✅ Confirmés" />
                    <Tab label="❌ Refusés" />
                </Tabs>
            </Paper>

            {/* Tableau des rendez-vous */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Date & Heure</TableCell>
                                <TableCell>Motif</TableCell>
                                <TableCell>Date demande</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAppointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography sx={{ py: 4, color: 'text.secondary' }}>
                                            Aucun rendez-vous dans cette catégorie
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAppointments.map((app) => (
                                    <TableRow key={app.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
                                                    <PersonIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {app.patient.prenom} {app.patient.nom}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        <PhoneIcon sx={{ fontSize: 10 }} /> {app.patient.telephone}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <AccessTimeIcon sx={{ fontSize: 14, color: 'action.active' }} />
                                                <Typography variant="body2">
                                                    {new Date(app.date_heure).toLocaleString('fr-FR', {
                                                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{app.motif}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {app.notes?.substring(0, 50)}...
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(app.date_demande).toLocaleDateString('fr-FR')}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(app.date_demande).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(app.statut)}</TableCell>
                                        <TableCell>
                                            {app.statut === 'en_attente' && (
                                                <>
                                                    <IconButton 
                                                        size="small" 
                                                        color="success" 
                                                        onClick={() => confirmAppointment(app.id)}
                                                        title="Confirmer le rendez-vous"
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        size="small" 
                                                        color="error" 
                                                        onClick={() => rejectAppointment(app.id)}
                                                        title="Refuser le rendez-vous"
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                            {app.statut === 'confirme' && (
                                                <IconButton 
                                                    size="small" 
                                                    color="warning" 
                                                    onClick={() => putOnHold(app.id)}
                                                    title="Mettre en attente"
                                                >
                                                    <PendingIcon />
                                                </IconButton>
                                            )}
                                            <IconButton 
                                                size="small" 
                                                color="info" 
                                                onClick={() => {
                                                    setSelectedAppointment(app);
                                                    setOpenDetailDialog(true);
                                                }}
                                                title="Voir détails"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialogue détails patient */}
            <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    Détails du patient
                </DialogTitle>
                <DialogContent>
                    {selectedAppointment && (
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="subtitle2" color="primary">Informations patient</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography><strong>Nom:</strong> {selectedAppointment.patient.nom}</Typography>
                                        <Typography><strong>Prénom:</strong> {selectedAppointment.patient.prenom}</Typography>
                                        <Typography><strong>Téléphone:</strong> {selectedAppointment.patient.telephone}</Typography>
                                        <Typography><strong>Email:</strong> {selectedAppointment.patient.email}</Typography>
                                        <Typography><strong>NSS:</strong> {selectedAppointment.patient.nss}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                        <Typography variant="subtitle2" color="primary">Détails rendez-vous</Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography><strong>Date:</strong> {new Date(selectedAppointment.date_heure).toLocaleDateString('fr-FR')}</Typography>
                                        <Typography><strong>Heure:</strong> {new Date(selectedAppointment.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Typography>
                                        <Typography><strong>Motif:</strong> {selectedAppointment.motif}</Typography>
                                        <Typography><strong>Notes:</strong> {selectedAppointment.notes}</Typography>
                                        <Typography><strong>Statut:</strong> {selectedAppointment.statut}</Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button variant="outlined" onClick={() => setOpenDetailDialog(false)}>Fermer</Button>
                                {selectedAppointment.statut === 'en_attente' && (
                                    <>
                                        <Button variant="contained" color="success" onClick={() => { confirmAppointment(selectedAppointment.id); setOpenDetailDialog(false); }}>
                                            Confirmer RDV
                                        </Button>
                                        <Button variant="contained" color="error" onClick={() => { rejectAppointment(selectedAppointment.id); setOpenDetailDialog(false); }}>
                                            Refuser RDV
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default DoctorAppointments;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Alert, Snackbar,
    Stepper, Step, StepLabel, Chip, Avatar, Divider, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';

function PatientPortal() {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [notification, setNotification] = useState(null);
    
    // Formulaire patient
    const [patientInfo, setPatientInfo] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        nss: ''
    });
    
    // Formulaire rendez-vous
    const [appointment, setAppointment] = useState({
        medecin_id: '',
        date: '',
        heure: '',
        motif: '',
        specialite: ''
    });
    
    // Données
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rendezVousConfirme, setRendezVousConfirme] = useState(null);

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = () => {
        setDoctors([
            { id: 1, nom: 'DUPONT', prenom: 'Jean', specialite: 'Cardiologue', telephone: '0612345678', disponibilites: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { id: 2, nom: 'LEBRUN', prenom: 'Sophie', specialite: 'Pédiatre', telephone: '0623456789', disponibilites: ['08:30', '09:30', '10:30', '13:30', '14:30'] },
            { id: 3, nom: 'MARTIN', prenom: 'Pierre', specialite: 'Généraliste', telephone: '0634567890', disponibilites: ['09:00', '10:00', '11:00', '15:00', '16:00'] },
            { id: 4, nom: 'BERNARD', prenom: 'Marie', specialite: 'Dermatologue', telephone: '0645678901', disponibilites: ['08:00', '09:00', '10:00', '13:00', '14:00'] },
        ]);
    };

    const steps = ['Vos informations', 'Choisir médecin', 'Choisir date/heure', 'Confirmation'];

    const handleNext = () => {
        if (activeStep === 0 && (!patientInfo.nom || !patientInfo.prenom || !patientInfo.telephone)) {
            setSnackbar({ open: true, message: 'Veuillez remplir tous les champs', severity: 'error' });
            return;
        }
        if (activeStep === 1 && !appointment.medecin_id) {
            setSnackbar({ open: true, message: 'Veuillez choisir un médecin', severity: 'error' });
            return;
        }
        if (activeStep === 2 && (!appointment.date || !appointment.heure)) {
            setSnackbar({ open: true, message: 'Veuillez choisir date et heure', severity: 'error' });
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleConfirmRendezVous = () => {
        const rdv = {
            id: Date.now(),
            patient: patientInfo,
            medecin: selectedDoctor,
            date: appointment.date,
            heure: appointment.heure,
            motif: appointment.motif,
            statut: 'confirme',
            dateCreation: new Date().toISOString()
        };
        setRendezVousConfirme(rdv);
        
        // Envoyer notification
        setNotification({
            title: 'Rendez-vous confirmé !',
            message: `Bonjour ${patientInfo.prenom}, votre rendez-vous avec Dr. ${selectedDoctor.prenom} ${selectedDoctor.nom} est confirmé pour le ${new Date(appointment.date).toLocaleDateString('fr-FR')} à ${appointment.heure}`,
            type: 'success'
        });
        
        setSnackbar({ open: true, message: 'Rendez-vous confirmé ! Un SMS vous a été envoyé.', severity: 'success' });
        setActiveStep(3);
    };

    const getAvailableHours = () => {
        if (!selectedDoctor) return [];
        return selectedDoctor.disponibilites;
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* En-tête */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#00bcd4', color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🏥 Prendre un rendez-vous
                </Typography>
                <Typography variant="body1">
                    Remplissez le formulaire pour prendre rendez-vous avec un médecin
                </Typography>
            </Paper>

            {/* Notification en temps réel */}
            {notification && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#e8f5e9', border: '1px solid #4caf50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <NotificationsActiveIcon sx={{ color: '#4caf50', fontSize: 40 }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ color: '#2e7d32' }}>{notification.title}</Typography>
                            <Typography variant="body2">{notification.message}</Typography>
                        </Box>
                        <IconButton onClick={() => setNotification(null)}>✕</IconButton>
                    </Box>
                </Paper>
            )}

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Formulaire */}
            <Paper sx={{ p: 4, borderRadius: 3 }}>
                {/* Étape 1 - Informations patient */}
                {activeStep === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Vos informations personnelles</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Nom" value={patientInfo.nom} onChange={(e) => setPatientInfo({...patientInfo, nom: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Prénom" value={patientInfo.prenom} onChange={(e) => setPatientInfo({...patientInfo, prenom: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Téléphone" value={patientInfo.telephone} onChange={(e) => setPatientInfo({...patientInfo, telephone: e.target.value})} required />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email" type="email" value={patientInfo.email} onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Numéro Sécurité Sociale" value={patientInfo.nss} onChange={(e) => setPatientInfo({...patientInfo, nss: e.target.value})} />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Étape 2 - Choisir médecin */}
                {activeStep === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Choisissez votre médecin</Typography>
                        <Grid container spacing={3}>
                            {doctors.map((doctor) => (
                                <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                                    <Card 
                                        sx={{ 
                                            cursor: 'pointer',
                                            border: appointment.medecin_id === doctor.id ? '2px solid #00bcd4' : '1px solid #e0e0e0',
                                            '&:hover': { boxShadow: 6 }
                                        }}
                                        onClick={() => {
                                            setAppointment({...appointment, medecin_id: doctor.id, specialite: doctor.specialite});
                                            setSelectedDoctor(doctor);
                                        }}
                                    >
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: '#00bcd4', width: 50, height: 50 }}>
                                                    <LocalHospitalIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6">Dr. {doctor.prenom} {doctor.nom}</Typography>
                                                    <Chip label={doctor.specialite} size="small" color="primary" />
                                                </Box>
                                            </Box>
                                            <Typography variant="body2"><PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} /> {doctor.telephone}</Typography>
                                            <Typography variant="caption" color="text.secondary">Disponible aujourd'hui</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Étape 3 - Choisir date et heure */}
                {activeStep === 2 && selectedDoctor && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Choisissez la date et l'heure</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Date"
                                    value={appointment.date}
                                    onChange={(e) => setAppointment({...appointment, date: e.target.value})}
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Heure</InputLabel>
                                    <Select value={appointment.heure} onChange={(e) => setAppointment({...appointment, heure: e.target.value})} label="Heure">
                                        {getAvailableHours().map((hour) => (
                                            <MenuItem key={hour} value={hour}>{hour}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Motif de la consultation"
                                    multiline
                                    rows={3}
                                    value={appointment.motif}
                                    onChange={(e) => setAppointment({...appointment, motif: e.target.value})}
                                    placeholder="Décrivez brièvement votre symptôme ou le motif de votre visite..."
                                />
                            </Grid>
                        </Grid>

                        {/* Récapitulatif */}
                        {appointment.date && appointment.heure && (
                            <Paper sx={{ p: 2, mt: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>📅 Récapitulatif</Typography>
                                <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="body2"><PersonIcon sx={{ fontSize: 14, mr: 0.5 }} /> Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</Typography>
                                    <Typography variant="body2"><CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} /> {new Date(appointment.date).toLocaleDateString('fr-FR')}</Typography>
                                    <Typography variant="body2"><AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} /> {appointment.heure}</Typography>
                                </Box>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* Étape 4 - Confirmation */}
                {activeStep === 3 && rendezVousConfirme && (
                    <Box sx={{ textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2e7d32' }}>
                            Rendez-vous confirmé !
                        </Typography>
                        
                        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'left' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>📋 Détails de votre rendez-vous</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2"><strong>Patient :</strong> {rendezVousConfirme.patient.prenom} {rendezVousConfirme.patient.nom}</Typography>
                                    <Typography variant="body2"><strong>Téléphone :</strong> {rendezVousConfirme.patient.telephone}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2"><strong>Médecin :</strong> Dr. {rendezVousConfirme.medecin.prenom} {rendezVousConfirme.medecin.nom}</Typography>
                                    <Typography variant="body2"><strong>Spécialité :</strong> {rendezVousConfirme.medecin.specialite}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="body2"><strong>Date :</strong> {new Date(rendezVousConfirme.date).toLocaleDateString('fr-FR')} à {rendezVousConfirme.heure}</Typography>
                                    <Typography variant="body2"><strong>Motif :</strong> {rendezVousConfirme.motif || 'Consultation générale'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Alert severity="info" sx={{ mb: 3 }}>
                            <strong>📱 Notification envoyée !</strong><br />
                            Un SMS de confirmation a été envoyé au {patientInfo.telephone}<br />
                            Un email de rappel vous sera envoyé 24h avant votre rendez-vous.
                        </Alert>

                        <Button 
                            variant="contained" 
                            sx={{ bgcolor: '#00bcd4' }}
                            onClick={() => {
                                setActiveStep(0);
                                setPatientInfo({ nom: '', prenom: '', telephone: '', email: '', nss: '' });
                                setAppointment({ medecin_id: '', date: '', heure: '', motif: '', specialite: '' });
                                setSelectedDoctor(null);
                                setRendezVousConfirme(null);
                            }}
                        >
                            Prendre un autre rendez-vous
                        </Button>
                    </Box>
                )}

                {/* Boutons navigation */}
                {activeStep < 3 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button disabled={activeStep === 0} onClick={handleBack}>
                            Retour
                        </Button>
                        <Button 
                            variant="contained" 
                            onClick={activeStep === 2 ? handleConfirmRendezVous : handleNext}
                            sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' } }}
                        >
                            {activeStep === 2 ? 'Confirmer le rendez-vous' : 'Continuer'}
                        </Button>
                    </Box>
                )}
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default PatientPortal;

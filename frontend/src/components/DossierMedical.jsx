import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Button, Box, AppBar, Toolbar, IconButton,
    Card, CardContent, CardHeader, Grid, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, MenuItem, Alert, Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import axios from 'axios';

function DossierMedical() {
    const { patientId } = useParams();
    const [dossiers, setDossiers] = useState([]);
    const [patient, setPatient] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        type: 'consultation',
        contenu: {
            diagnostic: '',
            prescription: '',
            notes: ''
        }
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (patientId) {
            fetchPatient();
            fetchDossiers();
        } else {
            // Si pas de patientId, afficher une liste des patients récents
            fetchRecentPatients();
        }
    }, [patientId]);

    const fetchPatient = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`import.meta.env.VITE_API_URL/api/patients/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatient(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const fetchDossiers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`import.meta.env.VITE_API_URL/api/dossiers/patient/${patientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDossiers(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const fetchRecentPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('import.meta.env.VITE_API_URL/api/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDossiers(response.data.slice(0, 10));
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = {
                patient_id: parseInt(patientId),
                medecin_id: user.id,
                type: formData.type,
                contenu: formData.contenu
            };
            await axios.post('import.meta.env.VITE_API_URL/api/dossiers', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Dossier médical ajouté avec succès');
            setOpenDialog(false);
            fetchDossiers();
            setFormData({
                type: 'consultation',
                contenu: { diagnostic: '', prescription: '', notes: '' }
            });
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de l\'ajout');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'consultation': return 'primary';
            case 'prescription': return 'success';
            case 'resultat_analyse': return 'warning';
            default: return 'default';
        }
    };

    if (!patientId) {
        return (
            <>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Dossiers Médicaux
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>Sélectionnez un patient</Typography>
                    <Grid container spacing={2}>
                        {dossiers.map((patient) => (
                            <Grid item xs={12} sm={6} md={4} key={patient.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">
                                            {patient.nom} {patient.prenom}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            NSS: {patient.nss || 'Non renseigné'}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={() => navigate(`/dossiers/${patient.id}`)}
                                        >
                                            Voir dossier
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </>
        );
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/patients')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Dossier Médical - {patient?.nom} {patient?.prenom}
                    </Typography>
                    <Button color="inherit" onClick={() => setOpenDialog(true)}>
                        <AddIcon /> Nouvelle entrée
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Infos patient */}
                {patient && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Informations patient</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2"><strong>Nom complet:</strong> {patient.nom} {patient.prenom}</Typography>
                                <Typography variant="body2"><strong>Date naissance:</strong> {patient.date_naissance}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2"><strong>Téléphone:</strong> {patient.telephone || 'Non renseigné'}</Typography>
                                <Typography variant="body2"><strong>Groupe sanguin:</strong> {patient.groupe_sanguin || 'Non renseigné'}</Typography>
                            </Grid>
                        </Grid>
                        {patient.allergies && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2"><strong>Allergies:</strong></Typography>
                                <Chip label={patient.allergies} color="error" size="small" sx={{ mt: 1 }} />
                            </Box>
                        )}
                    </Paper>
                )}

                {/* Historique des dossiers */}
                <Typography variant="h6" gutterBottom>Historique médical</Typography>
                {dossiers.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="textSecondary">
                            Aucun dossier médical pour ce patient
                        </Typography>
                    </Paper>
                ) : (
                    dossiers.map((dossier) => (
                        <Card key={dossier.id} sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={<MedicalServicesIcon color={getTypeColor(dossier.type)} />}
                                title={dossier.type === 'consultation' ? 'Consultation' : 
                                       dossier.type === 'prescription' ? 'Prescription' : 'Résultat analyse'}
                                subheader={`Dr. ${dossier.medecin_nom} ${dossier.medecin_prenom} - ${new Date(dossier.date_consultation).toLocaleDateString()}`}
                            />
                            <CardContent>
                                {dossier.contenu.diagnostic && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="primary">Diagnostic:</Typography>
                                        <Typography variant="body2">{dossier.contenu.diagnostic}</Typography>
                                    </Box>
                                )}
                                {dossier.contenu.prescription && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" color="success.main">Prescription:</Typography>
                                        <Typography variant="body2">{dossier.contenu.prescription}</Typography>
                                    </Box>
                                )}
                                {dossier.contenu.notes && (
                                    <Box>
                                        <Typography variant="subtitle2">Notes:</Typography>
                                        <Typography variant="body2">{dossier.contenu.notes}</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </Container>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Ajouter au dossier médical</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        label="Type"
                        margin="normal"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <MenuItem value="consultation">Consultation</MenuItem>
                        <MenuItem value="prescription">Prescription</MenuItem>
                        <MenuItem value="resultat_analyse">Résultat d'analyse</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Diagnostic"
                        margin="normal"
                        multiline
                        rows={3}
                        value={formData.contenu.diagnostic}
                        onChange={(e) => setFormData({
                            ...formData,
                            contenu: { ...formData.contenu, diagnostic: e.target.value }
                        })}
                    />
                    <TextField
                        fullWidth
                        label="Prescription"
                        margin="normal"
                        multiline
                        rows={3}
                        value={formData.contenu.prescription}
                        onChange={(e) => setFormData({
                            ...formData,
                            contenu: { ...formData.contenu, prescription: e.target.value }
                        })}
                    />
                    <TextField
                        fullWidth
                        label="Notes complémentaires"
                        margin="normal"
                        multiline
                        rows={2}
                        value={formData.contenu.notes}
                        onChange={(e) => setFormData({
                            ...formData,
                            contenu: { ...formData.contenu, notes: e.target.value }
                        })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default DossierMedical;

import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, TextField, Button, Box,
    AppBar, Toolbar, IconButton, Alert, MenuItem, Grid
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

function PatientForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        nom: '', prenom: '', nss: '', date_naissance: '',
        email: '', telephone: '', adresse: '', groupe_sanguin: '', allergies: ''
    });

    useEffect(() => {
        if (id) {
            fetchPatient();
        }
    }, [id]);

    const fetchPatient = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`import.meta.env.VITE_API_URL/api/patients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(response.data);
        } catch (error) {
            setError('Erreur lors du chargement du patient');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (id) {
                await axios.put(`import.meta.env.VITE_API_URL/api/patients/${id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Patient modifié avec succès');
            } else {
                await axios.post('import.meta.env.VITE_API_URL/api/patients', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuccess('Patient créé avec succès');
                setTimeout(() => navigate('/patients'), 2000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        }
    };

    const groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/patients')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {id ? 'Modifier Patient' : 'Nouveau Patient'}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="N° Sécurité Sociale"
                                    name="nss"
                                    value={formData.nss}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Date de naissance"
                                    name="date_naissance"
                                    type="date"
                                    value={formData.date_naissance}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Adresse"
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Groupe Sanguin"
                                    name="groupe_sanguin"
                                    value={formData.groupe_sanguin}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">Non renseigné</MenuItem>
                                    {groupesSanguins.map(groupe => (
                                        <MenuItem key={groupe} value={groupe}>{groupe}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Allergies"
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                    placeholder="Aucune allergie connue"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                            >
                                {id ? 'Mettre à jour' : 'Enregistrer'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </>
    );
}

export default PatientForm;

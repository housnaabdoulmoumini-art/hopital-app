import React, { useState } from 'react';
import {
    Container, Paper, TextField, Button, Typography, Box, Alert,
    CircularProgress, IconButton, InputAdornment, Link, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [telephone, setTelephone] = useState('');

    const handleTogglePassword = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                const response = await axios.post('import.meta.env.VITE_API_URL/api/login', { email, password });
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    onLogin();
                    navigate('/');
                }
            } else {
                const response = await axios.post('import.meta.env.VITE_API_URL/api/register', {
                    email,
                    password,
                    nom,
                    prenom,
                    telephone,
                    role: 'patient'
                });
                if (response.data.success) {
                    setSuccess('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
                    setIsLogin(true);
                    setPassword('');
                    setNom('');
                    setPrenom('');
                    setTelephone('');
                }
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data?.error || 'Une erreur est survenue');
            } else if (err.request) {
                setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
            } else {
                setError('Erreur de connexion');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                <Paper sx={{ p: 5, borderRadius: 4, width: '100%' }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <LocalHospitalIcon sx={{ fontSize: 60, color: '#00bcd4' }} />
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00bcd4', mt: 2 }}>
                            HOPITAL V6
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gestion Hospitalière
                        </Typography>
                    </Box>

                    <Typography variant="h5" align="center" gutterBottom>
                        {isLogin ? 'Connexion' : 'Créer un compte'}
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    margin="normal"
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    margin="normal"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    margin="normal"
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                    disabled={loading}
                                />
                            </>
                        )}

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            label="Mot de passe"
                            type={showPassword ? 'text' : 'password'}
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleTogglePassword} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' } }}
                        >
                            {loading ? <CircularProgress size={24} /> : (isLogin ? 'Se connecter' : 'S\'inscrire')}
                        </Button>
                    </form>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                                setSuccess('');
                            }}
                            sx={{ cursor: 'pointer' }}
                        >
                            {isLogin ? "Pas encore de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}

export default Login;

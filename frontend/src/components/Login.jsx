import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Utiliser la bonne route /api/login (pas /api/auth/login)
            const response = await axios.post('http://localhost:3001/api/login', { 
                email, 
                password 
            });
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onLogin();
                navigate('/');
            }
        } catch (err) {
            console.error('Erreur login:', err);
            if (err.response) {
                setError(err.response.data?.error || 'Email ou mot de passe incorrect');
            } else if (err.request) {
                setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur le port 3001');
            } else {
                setError('Erreur de connexion');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f5f5f5'
            }}>
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
                        Connexion
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="admin@hopital.com"
                        />
                        <TextField
                            fullWidth
                            label="Mot de passe"
                            type="password"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="admin123"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 3, 
                                mb: 2, 
                                py: 1.5,
                                bgcolor: '#00bcd4',
                                '&:hover': { bgcolor: '#00acc1' }
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
                        </Button>
                    </form>
                    
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                        Identifiants par défaut: admin@hopital.com / admin123
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}

export default Login;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Grid, Paper, Typography, Box, Card, CardContent, 
    Avatar, CircularProgress, LinearProgress, Divider, Button, IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import MedicationIcon from '@mui/icons-material/Medication';
import axios from 'axios';

function Accueil() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalMedecins: 0,
        totalRendezVous: 0,
        rdvConfirmes: 0,
        rdvEnAttente: 0,
        rdvTermines: 0,
        totalOrdonnances: 0,
        totalFactures: 0,
        chiffreAffaires: 0,
        tauxOccupation: 0
    });
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchStats = useCallback(async () => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [patientsRes, medecinsRes, rdvRes, ordonnancesRes, facturesRes] = await Promise.all([
                axios.get('https://hopital-backend.onrender.com/api/patients', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/medecins', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/rendez-vous', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/ordonnances', { headers }),
                axios.get('https://hopital-backend.onrender.com/api/factures', { headers })
            ]);
            
            const rdvData = rdvRes.data;
            const rdvConfirmes = rdvData.filter(r => r.statut === 'confirme').length;
            const rdvEnAttente = rdvData.filter(r => r.statut === 'en_attente').length;
            const rdvTermines = rdvData.filter(r => r.statut === 'termine').length;
            
            // Calcul du chiffre d'affaires
            const facturesData = facturesRes.data;
            const chiffreAffaires = facturesData
                .filter(f => f.statut === 'payee')
                .reduce((sum, f) => sum + (parseFloat(f.montant_ttc) || 0), 0);
            
            // Calcul du taux d'occupation
            const today = new Date().toISOString().split('T')[0];
            const rdvAujourdhui = rdvData.filter(r => 
                r.date_heure && r.date_heure.split('T')[0] === today && r.statut === 'confirme'
            ).length;
            
            const tauxOccupation = medecinsRes.data.length > 0 
                ? Math.round((rdvAujourdhui / (medecinsRes.data.length * 8)) * 100)
                : 0;
            
            setStats({
                totalPatients: patientsRes.data.length,
                totalMedecins: medecinsRes.data.length,
                totalRendezVous: rdvData.length,
                rdvConfirmes: rdvConfirmes,
                rdvEnAttente: rdvEnAttente,
                rdvTermines: rdvTermines,
                totalOrdonnances: ordonnancesRes.data.length,
                totalFactures: facturesData.length,
                chiffreAffaires: chiffreAffaires,
                tauxOccupation: Math.min(tauxOccupation, 100)
            });
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Rafraîchir automatiquement toutes les 30 secondes
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const mainCards = [
        { title: 'Patients', value: stats.totalPatients, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2', bg: '#e3f2fd', path: '/patients' },
        { title: 'Médecins', value: stats.totalMedecins, icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />, color: '#2e7d32', bg: '#e8f5e9', path: '/medecins' },
        { title: 'Rendez-vous', value: stats.totalRendezVous, icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />, color: '#ed6c02', bg: '#fff3e0', path: '/rendez-vous' },
        { title: 'Ordonnances', value: stats.totalOrdonnances, icon: <MedicationIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', bg: '#f3e5f5', path: '/ordonnances' },
    ];

    const statusCards = [
        { title: 'Confirmés', value: stats.rdvConfirmes, icon: <CheckCircleIcon sx={{ fontSize: 30 }} />, color: '#4caf50', bg: '#e8f5e9' },
        { title: 'En attente', value: stats.rdvEnAttente, icon: <PendingIcon sx={{ fontSize: 30 }} />, color: '#ff9800', bg: '#fff3e0' },
        { title: 'Terminés', value: stats.rdvTermines, icon: <CheckCircleIcon sx={{ fontSize: 30 }} />, color: '#2196f3', bg: '#e3f2fd' },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Tableau de bord
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                </Box>
                <IconButton onClick={fetchStats} disabled={refreshing} color="primary">
                    <RefreshIcon className={refreshing ? 'spin' : ''} />
                </IconButton>
            </Box>

            {/* Cartes principales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {mainCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ borderRadius: 3, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }} onClick={() => navigate(card.path)}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: card.color }}>{card.value}</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 1 }}>{card.title}</Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56 }}>{card.icon}</Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* État des rendez-vous */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>📊 État des rendez-vous</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            {statusCards.map((card, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                    <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, cursor: 'pointer' }} onClick={() => navigate('/rendez-vous')}>
                                        <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 60, height: 60, mx: 'auto', mb: 2 }}>{card.icon}</Avatar>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: card.color }}>{card.value}</Typography>
                                        <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>💰 Chiffre d'affaires</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#4caf50', textAlign: 'center' }}>
                            {stats.chiffreAffaires.toFixed(2)} €
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            Basé sur les factures payées
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                            {stats.totalFactures} factures émises
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Taux d'occupation */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>📈 Taux d'occupation</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <LinearProgress variant="determinate" value={stats.tauxOccupation} sx={{ flex: 1, height: 12, borderRadius: 6 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: stats.tauxOccupation > 70 ? '#ed6c02' : '#4caf50' }}>{stats.tauxOccupation}%</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Basé sur les rendez-vous confirmés du jour</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.totalRendezVous > 0 ? Math.round((stats.rdvConfirmes / (stats.totalRendezVous || 1)) * 100) : 0}%</Typography>
                        <Typography variant="body2" color="text.secondary">Taux de confirmation des RDV</Typography>
                    </Paper>
                </Grid>
            </Grid>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </Box>
    );
}

export default Accueil;

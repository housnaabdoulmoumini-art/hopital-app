import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar, CircularProgress, LinearProgress, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import MedicationIcon from '@mui/icons-material/Medication';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function Stats() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalPatients: 0, totalMedecins: 0, totalRendezVous: 0,
        rdvConfirmes: 0, rdvEnAttente: 0, rdvAnnules: 0, rdvTermines: 0,
        totalOrdonnances: 0, totalFactures: 0, chiffreAffaires: 0,
        evolution: []
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
            
            // Statistiques par jour pour l'évolution
            const rdvParJour = {};
            rdvData.forEach(rdv => {
                if (rdv.date_heure) {
                    const date = new Date(rdv.date_heure).toLocaleDateString('fr-FR');
                    if (!rdvParJour[date]) rdvParJour[date] = { date, rdv: 0 };
                    rdvParJour[date].rdv++;
                }
            });
            
            const evolutionData = Object.values(rdvParJour).slice(-7).reverse();
            
            // Chiffre d'affaires
            const facturesData = facturesRes.data;
            const chiffreAffaires = facturesData
                .filter(f => f.statut === 'payee')
                .reduce((sum, f) => sum + (parseFloat(f.montant_ttc) || 0), 0);
            
            setStats({
                totalPatients: patientsRes.data.length,
                totalMedecins: medecinsRes.data.length,
                totalRendezVous: rdvData.length,
                rdvConfirmes: rdvData.filter(r => r.statut === 'confirme').length,
                rdvEnAttente: rdvData.filter(r => r.statut === 'en_attente').length,
                rdvAnnules: rdvData.filter(r => r.statut === 'annule').length,
                rdvTermines: rdvData.filter(r => r.statut === 'termine').length,
                totalOrdonnances: ordonnancesRes.data.length,
                totalFactures: facturesData.length,
                chiffreAffaires: chiffreAffaires,
                evolution: evolutionData
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

    const rdvStatusData = [
        { name: 'Confirmés', value: stats.rdvConfirmes, color: '#4caf50' },
        { name: 'En attente', value: stats.rdvEnAttente, color: '#ff9800' },
        { name: 'Terminés', value: stats.rdvTermines, color: '#2196f3' },
        { name: 'Annulés', value: stats.rdvAnnules, color: '#f44336' }
    ].filter(item => item.value > 0);

    const mainCards = [
        { title: 'Patients', value: stats.totalPatients, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2', bg: '#e3f2fd' },
        { title: 'Médecins', value: stats.totalMedecins, icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />, color: '#2e7d32', bg: '#e8f5e9' },
        { title: 'Rendez-vous', value: stats.totalRendezVous, icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />, color: '#ed6c02', bg: '#fff3e0' },
        { title: 'Ordonnances', value: stats.totalOrdonnances, icon: <MedicationIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', bg: '#f3e5f5' },
    ];

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>📊 Statistiques</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                </Box>
                <IconButton onClick={fetchStats} disabled={refreshing} color="primary">
                    <RefreshIcon className={refreshing ? 'spin' : ''} />
                </IconButton>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {mainCards.map((card, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box><Typography variant="h3" sx={{ fontWeight: 'bold', color: card.color }}>{card.value}</Typography><Typography variant="body2">{card.title}</Typography></Box>
                                    <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56 }}>{card.icon}</Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>📊 Répartition des rendez-vous</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={rdvStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {rdvStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>📈 Évolution des rendez-vous</Typography>
                        {stats.evolution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.evolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="rdv" fill="#1976d2" radius={[10, 10, 0, 0]} name="Nombre de RDV" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 5 }}><Typography color="text.secondary">Aucune donnée d'évolution disponible</Typography></Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>📈 Indicateurs clés</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}><CheckCircleIcon sx={{ fontSize: 40, color: '#4caf50' }} /><Typography variant="h4">{stats.rdvConfirmes}</Typography><Typography variant="caption">Confirmés</Typography></Box></Grid>
                            <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}><PendingIcon sx={{ fontSize: 40, color: '#ff9800' }} /><Typography variant="h4">{stats.rdvEnAttente}</Typography><Typography variant="caption">En attente</Typography></Box></Grid>
                            <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}><CheckCircleIcon sx={{ fontSize: 40, color: '#2196f3' }} /><Typography variant="h4">{stats.rdvTermines}</Typography><Typography variant="caption">Terminés</Typography></Box></Grid>
                            <Grid item xs={6} sm={3}><Box sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 2 }}><CancelIcon sx={{ fontSize: 40, color: '#f44336' }} /><Typography variant="h4">{stats.rdvAnnules}</Typography><Typography variant="caption">Annulés</Typography></Box></Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>💰 Finances</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                    <ReceiptIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                                    <Typography variant="h4">{stats.totalFactures}</Typography>
                                    <Typography variant="caption">Factures émises</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                                    <TrendingUpIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                                    <Typography variant="h4">{stats.chiffreAffaires.toFixed(2)} €</Typography>
                                    <Typography variant="caption">Chiffre d'affaires</Typography>
                                </Box>
                            </Grid>
                        </Grid>
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

export default Stats;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, 
    Avatar, CircularProgress, Divider, Chip, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import MedicationIcon from '@mui/icons-material/Medication';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
    ResponsiveContainer
} from 'recharts';

function Stats() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        patients: { total: 0, newThisMonth: 0, evolution: 0 },
        medecins: { total: 0, disponibles: 0, occupes: 0, conges: 0 },
        rendezVous: { total: 0, confirmes: 0, enAttente: 0, termines: 0, annules: 0 },
        ordonnances: { total: 0, actives: 0, expirees: 0 },
        evolution: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [patientsRes, medecinsRes, rdvRes, ordonnancesRes] = await Promise.all([
                axios.get('import.meta.env.VITE_API_URL/api/patients', { headers }),
                axios.get('import.meta.env.VITE_API_URL/api/medecins', { headers }),
                axios.get('import.meta.env.VITE_API_URL/api/rendez-vous', { headers }),
                axios.get('import.meta.env.VITE_API_URL/api/ordonnances', { headers })
            ]);
            
            const rdvData = rdvRes.data;
            
            // Statistiques rendez-vous par jour (pour le graphique)
            const rdvParJour = {};
            rdvData.forEach(rdv => {
                if (rdv.date_heure) {
                    const date = new Date(rdv.date_heure).toLocaleDateString('fr-FR');
                    if (!rdvParJour[date]) {
                        rdvParJour[date] = { date, confirmes: 0, enAttente: 0, annules: 0 };
                    }
                    if (rdv.statut === 'confirme') rdvParJour[date].confirmes++;
                    else if (rdv.statut === 'en_attente') rdvParJour[date].enAttente++;
                    else if (rdv.statut === 'annule') rdvParJour[date].annules++;
                }
            });
            
            const evolutionData = Object.values(rdvParJour).slice(-7).reverse();
            
            // Données pour le graphique circulaire
            const rdvStatusData = [
                { name: 'Confirmés', value: rdvData.filter(r => r.statut === 'confirme').length, color: '#4caf50' },
                { name: 'En attente', value: rdvData.filter(r => r.statut === 'en_attente').length, color: '#ff9800' },
                { name: 'Terminés', value: rdvData.filter(r => r.statut === 'termine').length, color: '#2196f3' },
                { name: 'Annulés', value: rdvData.filter(r => r.statut === 'annule').length, color: '#f44336' }
            ];
            
            // Données pour les médecins
            const medecinsData = medecinsRes.data;
            const medecinsParSpecialite = {};
            medecinsData.forEach(m => {
                const specialite = m.specialite || 'Autre';
                medecinsParSpecialite[specialite] = (medecinsParSpecialite[specialite] || 0) + 1;
            });
            
            const specialitesData = Object.entries(medecinsParSpecialite).map(([name, value]) => ({ name, value }));
            
            setStats({
                patients: {
                    total: patientsRes.data.length,
                    newThisMonth: Math.floor(patientsRes.data.length * 0.15),
                    evolution: 15
                },
                medecins: {
                    total: medecinsData.length,
                    disponibles: medecinsData.filter(m => m.disponibilite === 'disponible').length,
                    occupes: medecinsData.filter(m => m.disponibilite === 'occupe').length,
                    conges: medecinsData.filter(m => m.disponibilite === 'conges').length
                },
                rendezVous: {
                    total: rdvData.length,
                    confirmes: rdvData.filter(r => r.statut === 'confirme').length,
                    enAttente: rdvData.filter(r => r.statut === 'en_attente').length,
                    termines: rdvData.filter(r => r.statut === 'termine').length,
                    annules: rdvData.filter(r => r.statut === 'annule').length
                },
                ordonnances: {
                    total: ordonnancesRes.data.length,
                    actives: ordonnancesRes.data.filter(o => o.statut === 'active').length,
                    expirees: ordonnancesRes.data.filter(o => o.statut === 'expiree').length
                },
                evolution: evolutionData,
                rdvStatusData,
                specialitesData
            });
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { 
            title: 'Patients', 
            value: stats.patients.total, 
            subValue: `+${stats.patients.newThisMonth} ce mois`,
            icon: <PeopleIcon sx={{ fontSize: 40 }} />, 
            color: '#1976d2', 
            bg: '#e3f2fd',
            evolution: '+12%'
        },
        { 
            title: 'Médecins', 
            value: stats.medecins.total, 
            subValue: `${stats.medecins.disponibles} disponibles`,
            icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />, 
            color: '#2e7d32', 
            bg: '#e8f5e9',
            evolution: '0%'
        },
        { 
            title: 'Rendez-vous', 
            value: stats.rendezVous.total, 
            subValue: `${stats.rendezVous.confirmes} confirmés`,
            icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />, 
            color: '#ed6c02', 
            bg: '#fff3e0',
            evolution: '+8%'
        },
        { 
            title: 'Ordonnances', 
            value: stats.ordonnances.total, 
            subValue: `${stats.ordonnances.actives} actives`,
            icon: <MedicationIcon sx={{ fontSize: 40 }} />, 
            color: '#9c27b0', 
            bg: '#f3e5f5',
            evolution: '+5%'
        },
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
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                📊 Statistiques
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                Analyse des données et indicateurs de performance
            </Typography>

            {/* Cartes statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: card.color }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 1 }}>
                                            {card.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {card.subValue}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56 }}>
                                        {card.icon}
                                    </Avatar>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                                    <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                                    <Typography variant="caption" color="success.main">
                                        {card.evolution}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        vs mois dernier
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Graphiques */}
            <Grid container spacing={3}>
                {/* Évolution des rendez-vous */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            📈 Évolution des rendez-vous
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {stats.evolution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={stats.evolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="confirmes" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.6} name="Confirmés" />
                                    <Area type="monotone" dataKey="enAttente" stackId="1" stroke="#ff9800" fill="#ff9800" fillOpacity={0.6} name="En attente" />
                                    <Area type="monotone" dataKey="annules" stackId="1" stroke="#f44336" fill="#f44336" fillOpacity={0.6} name="Annulés" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography color="text.secondary">Aucune donnée disponible</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Répartition des rendez-vous */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            🥧 Répartition des RDV
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {stats.rdvStatusData && stats.rdvStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={stats.rdvStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.rdvStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography color="text.secondary">Aucune donnée disponible</Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                            {stats.rdvStatusData?.map((item, idx) => (
                                <Chip 
                                    key={idx}
                                    label={`${item.name}: ${item.value}`}
                                    size="small"
                                    sx={{ bgcolor: item.color, color: 'white' }}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Spécialités des médecins */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            👨‍⚕️ Répartition par spécialité
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {stats.specialitesData && stats.specialitesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.specialitesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#1976d2" radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                <Typography color="text.secondary">Aucune donnée disponible</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Statut des médecins */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            🏥 Disponibilité des médecins
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#e8f5e9', color: '#4caf50', width: 60, height: 60, mx: 'auto', mb: 1 }}>
                                        <CheckCircleIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                        {stats.medecins.disponibles}
                                    </Typography>
                                    <Typography variant="caption">Disponibles</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff9800', width: 60, height: 60, mx: 'auto', mb: 1 }}>
                                        <PendingIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                        {stats.medecins.occupes}
                                    </Typography>
                                    <Typography variant="caption">En consultation</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Avatar sx={{ bgcolor: '#ffebee', color: '#f44336', width: 60, height: 60, mx: 'auto', mb: 1 }}>
                                        <CancelIcon />
                                    </Avatar>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                        {stats.medecins.conges}
                                    </Typography>
                                    <Typography variant="caption">En congés</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Ordonnances */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            💊 Statistiques des ordonnances
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center' }}>
                                    <CardContent>
                                        <Typography variant="h4" color="#4caf50">{stats.ordonnances.actives}</Typography>
                                        <Typography variant="body2">Ordonnances actives</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: '#ffebee', textAlign: 'center' }}>
                                    <CardContent>
                                        <Typography variant="h4" color="#f44336">{stats.ordonnances.expirees}</Typography>
                                        <Typography variant="body2">Ordonnances expirées</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center' }}>
                                    <CardContent>
                                        <Typography variant="h4" color="#1976d2">{stats.ordonnances.total}</Typography>
                                        <Typography variant="body2">Total ordonnances</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Stats;

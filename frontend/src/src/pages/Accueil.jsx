import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, LinearProgress, Avatar } from '@mui/material';
import { useOutletContext } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';

function Accueil() {
    const { searchTerm } = useOutletContext();
    const [stats, setStats] = useState({
        totalPatients: 1250,
        totalMedecins: 10,
        rdvAujourdhui: 24,
        rdvConfirmes: 18,
        tauxOccupation: 75
    });

    const cards = [
        { title: 'Patients', value: stats.totalPatients, icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2', bg: '#e3f2fd' },
        { title: 'Médecins', value: stats.totalMedecins, icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />, color: '#2e7d32', bg: '#e8f5e9' },
        { title: 'RDV Aujourd\'hui', value: stats.rdvAujourdhui, icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />, color: '#ed6c02', bg: '#fff3e0' },
        { title: 'RDV Confirmés', value: stats.rdvConfirmes, icon: <CheckCircleIcon sx={{ fontSize: 40 }} />, color: '#9c27b0', bg: '#f3e5f5' },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                Tableau de bord
            </Typography>
            
            <Grid container spacing={3}>
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: card.color }}>
                                            {card.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {card.title}
                                        </Typography>
                                    </Box>
                                    <Avatar sx={{ bgcolor: card.bg, color: card.color, width: 56, height: 56 }}>
                                        {card.icon}
                                    </Avatar>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>Taux d'occupation</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={stats.tauxOccupation} 
                                sx={{ flex: 1, height: 10, borderRadius: 5 }}
                            />
                            <Typography variant="body2">{stats.tauxOccupation}%</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Capacité actuelle du service
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>+15%</Typography>
                        <Typography variant="body2" color="text.secondary">d'activité ce mois</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Accueil;

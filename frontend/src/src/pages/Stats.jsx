import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

function Stats() {
    const stats = [
        { title: 'Patients', value: '1,250', change: '+12%', icon: <PeopleIcon sx={{ fontSize: 40 }} />, color: '#1976d2' },
        { title: 'Consultations', value: '3,456', change: '+8%', icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />, color: '#2e7d32' },
        { title: 'Médecins', value: '10', change: '0%', icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />, color: '#ed6c02' },
        { title: 'Taux satisfaction', value: '94%', change: '+5%', icon: <TrendingUpIcon sx={{ fontSize: 40 }} />, color: '#9c27b0' },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Statistiques</Typography>
            <Grid container spacing={3}>
                {stats.map((s, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent><Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Box><Typography variant="h4" sx={{ fontWeight: 'bold', color: s.color }}>{s.value}</Typography><Typography variant="body2" color="text.secondary">{s.title}</Typography><Typography variant="caption" color="success.main">{s.change}</Typography></Box><Box sx={{ color: s.color }}>{s.icon}</Box></Box></CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}><Typography variant="h6" gutterBottom>Activité mensuelle</Typography><LinearProgress variant="determinate" value={75} sx={{ height: 10, borderRadius: 5, mb: 2 }} /><Typography variant="caption">75% d'occupation sur le mois</Typography></Paper>
        </Box>
    );
}
export default Stats;

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Paper, Box, Avatar, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const menuItems = [
        { title: 'Patients', icon: <PeopleIcon sx={{ fontSize: 48 }} />, path: '/patients', color: '#1976d2', desc: 'Gérer les dossiers patients' },
        { title: 'Rendez-vous', icon: <CalendarTodayIcon sx={{ fontSize: 48 }} />, path: '/rendez-vous', color: '#2e7d32', desc: 'Planification des consultations' },
        { title: 'Dossiers médicaux', icon: <MedicalServicesIcon sx={{ fontSize: 48 }} />, path: '/dossiers', color: '#ed6c02', desc: 'Historique médical' },
        { title: 'Statistiques', icon: <BarChartIcon sx={{ fontSize: 48 }} />, path: '/stats', color: '#9c27b0', desc: 'Analyse des données' },
        { title: 'Paramètres', icon: <SettingsIcon sx={{ fontSize: 48 }} />, path: '/settings', color: '#607d8b', desc: 'Configuration du système' },
    ];

    // Si admin, ajouter panneau admin
    if (user.role === 'admin') {
        menuItems.push({ title: 'Administration', icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />, path: '/admin', color: '#d32f2f', desc: 'Gestion du système' });
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        🏥 {user.role === 'admin' ? 'Administration' : 'Gestion'} Hospitalière
                    </Typography>
                    
                    <Button color="inherit" onClick={() => navigate('/settings')} startIcon={<SettingsIcon />}>
                        Paramètres
                    </Button>
                    
                    <Button color="inherit" onClick={handleMenu}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#1976d2' }}>
                            {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                        </Avatar>
                        {user.nom} {user.prenom}
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Mon profil</MenuItem>
                        <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Paramètres</MenuItem>
                        <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Bienvenue, {user.prenom} {user.nom}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {user.role === 'admin' ? 'Vous avez tous les droits d\'administration' : 'Tableau de bord de gestion'}
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {menuItems.map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item.title}>
                            <Paper
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: 6
                                    },
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                                onClick={() => navigate(item.path)}
                            >
                                <Box sx={{ color: item.color, mb: 2 }}>
                                    {item.icon}
                                </Box>
                                <Typography variant="h6" gutterBottom>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}

export default Dashboard;

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Drawer, AppBar, Toolbar, Typography, IconButton,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    TextField, InputAdornment, Button, Avatar, Menu, MenuItem,
    Badge, Paper, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';

const drawerWidth = 280;

function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const menuItems = [
        { text: 'Accueil', icon: <HomeIcon />, path: '/accueil' },
        { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
        { text: 'Rendez-vous', icon: <CalendarTodayIcon />, path: '/rendez-vous' },
        { text: 'Médecins', icon: <LocalHospitalIcon />, path: '/medecins' },
        { text: 'Stats', icon: <BarChartIcon />, path: '/stats' },
        { text: 'Paramètres', icon: <SettingsIcon />, path: '/parametres' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a2e', color: 'white' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospitalIcon sx={{ color: '#00bcd4' }} />
                    HOPITAL V6
                </Typography>
                <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
                    Gestion Hospitalière
                </Typography>
            </Box>
            
            <List sx={{ flex: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton 
                            selected={location.pathname === item.path}
                            onClick={() => {
                                navigate(item.path);
                                setMobileOpen(false);
                            }}
                            sx={{
                                mx: 1, borderRadius: 2, mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: '#00bcd4',
                                    '&:hover': { backgroundColor: '#00acc1' },
                                    '& .MuiListItemIcon-root': { color: 'white' },
                                    '& .MuiListItemText-primary': { color: 'white', fontWeight: 'bold' }
                                },
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : '#888', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                primaryTypographyProps={{ fontSize: '0.9rem' }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ color: '#ff6b6b', borderColor: '#ff6b6b', '&:hover': { borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.1)' } }}
                >
                    Déconnexion
                </Button>
                <Typography variant="caption" sx={{ color: '#666', display: 'block', textAlign: 'center', mt: 2 }}>
                    © 2024 HOPITAL V6
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'white', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { sm: 'none' }, mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    
                    <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, color: '#00bcd4', fontWeight: 'bold' }}>
                        Tableau de bord
                    </Typography>
                    
                    <TextField
                        size="small"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 250, mr: 2, display: { xs: 'none', md: 'flex' } }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                    />
                    
                    <IconButton color="inherit">
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    
                    <Button 
                        color="inherit" 
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        startIcon={<Avatar sx={{ width: 32, height: 32, bgcolor: '#00bcd4' }}>{user.prenom?.charAt(0)}{user.nom?.charAt(0)}</Avatar>}
                    >
                        {user.prenom} {user.nom}
                    </Button>
                    
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                        <MenuItem onClick={() => { navigate('/parametres'); setAnchorEl(null); }}>Mon profil</MenuItem>
                        <MenuItem onClick={() => { navigate('/parametres'); setAnchorEl(null); }}>Paramètres</MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)`, mt: 8 } }}>
                <Outlet context={{ searchTerm }} />
            </Box>
        </Box>
    );
}

export default MainLayout;

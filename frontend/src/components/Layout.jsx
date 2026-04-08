import React, { useState } from 'react';
import { Receipt as ReceiptIcon,
    AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem,
    ListItemIcon, ListItemText, Box, Avatar, Menu, MenuItem,
    Divider, useTheme, useMediaQuery
} from '@mui/material';
import { Receipt as ReceiptIcon,
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    MedicalServices as MedicalServicesIcon,
    CalendarToday as CalendarIcon,
    Receipt as ReceiptIcon,
    Medication as MedicationIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { Receipt as ReceiptIcon, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
    { text: 'Médecins', icon: <MedicalServicesIcon />, path: '/medecins' },
    { text: 'Rendez-vous', icon: <CalendarIcon />, path: '/rendez-vous' },
{ text: 'Factures', icon: <ReceiptIcon />, path: '/factures' },
    { text: 'Ordonnances', icon: <MedicationIcon />, path: '/ordonnances' },
    { text: 'Factures', icon: <ReceiptIcon />, path: '/factures' },
];

function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const drawer = (
        <div>
            <Toolbar sx={{ justifyContent: 'center' }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                    🏥 Hôpital Gestion
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            setMobileOpen(false);
                        }}
                        sx={{
                            borderRadius: 2,
                            mx: 1,
                            mb: 0.5,
                            cursor: 'pointer',
                            backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
                            color: location.pathname === item.path ? 'white' : 'inherit',
                            '&:hover': {
                                backgroundColor: location.pathname === item.path ? 'primary.main' : 'action.hover',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: location.pathname === item.path ? 'white' : 'inherit' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {menuItems.find(item => item.path === location.pathname)?.text || 'Accueil'}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2">
                            {user.nom} {user.prenom}
                        </Typography>
                        <IconButton onClick={handleMenuOpen} color="inherit">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                            </Avatar>
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                                <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                                Mon profil
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                                Déconnexion
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', top: 64 } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
}

export default Layout;

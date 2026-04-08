import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Box, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Switch, FormControlLabel, TextField,
    Button, Alert, Divider, Grid, Card, CardContent, IconButton,
    AppBar, Toolbar, Avatar, Menu, MenuItem, Badge, Select, FormControl,
    InputLabel, Slider, RadioGroup, Radio, FormLabel, Tab, Tabs
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import BackupIcon from '@mui/icons-material/Backup';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import FolderIcon from '@mui/icons-material/Folder';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

function Settings() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [saved, setSaved] = useState(false);
    
    // État des paramètres
    const [settings, setSettings] = useState({
        // Affichage
        language: 'fr',
        theme: 'light',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        
        // Notifications
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        medicalAlerts: true,
        soundEnabled: true,
        
        // Sécurité
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5,
        auditLogs: true,
        
        // Médias
        imageQuality: 'high',
        autoBackup: true,
        backupFrequency: 'daily',
        storageLimit: 10,
        
        // Références
        consultationDuration: 20,
        emergencySlotDuration: 30,
        maxAppointmentsPerDay: 40,
        breakTime: 60,
        
        // Système d'administration
        adminEmail: 'admin@hopital.com',
        systemName: 'Hôpital Gestionnaire',
        maintenanceMode: false,
        debugMode: false,
        autoUpdate: true
    });

    // Charger les paramètres sauvegardés
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
        }
    };

    const saveSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/api/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
        }
    };

    const resetSettings = () => {
        setSettings({
            language: 'fr',
            theme: 'light',
            fontSize: 'medium',
            compactMode: false,
            animations: true,
            emailNotifications: true,
            smsNotifications: false,
            appointmentReminders: true,
            medicalAlerts: true,
            soundEnabled: true,
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginAttempts: 5,
            auditLogs: true,
            imageQuality: 'high',
            autoBackup: true,
            backupFrequency: 'daily',
            storageLimit: 10,
            consultationDuration: 20,
            emergencySlotDuration: 30,
            maxAppointmentsPerDay: 40,
            breakTime: 60,
            adminEmail: 'admin@hopital.com',
            systemName: 'Hôpital Gestionnaire',
            maintenanceMode: false,
            debugMode: false,
            autoUpdate: true
        });
    };

    const menuItems = [
        { icon: <DisplaySettingsIcon />, label: 'Affichage', tab: 0 },
        { icon: <NotificationsIcon />, label: 'Notifications', tab: 1 },
        { icon: <SecurityIcon />, label: 'Sécurité', tab: 2 },
        { icon: <FolderIcon />, label: 'Médias', tab: 3 },
        { icon: <MedicalServicesIcon />, label: 'Références', tab: 4 },
        { icon: <AdminPanelSettingsIcon />, label: 'Système', tab: 5 }
    ];

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <SettingsIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Paramètres du Système
                    </Typography>
                    <Button 
                        color="inherit" 
                        onClick={resetSettings}
                        startIcon={<RestartAltIcon />}
                        sx={{ mr: 1 }}
                    >
                        Réinitialiser
                    </Button>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={saveSettings}
                        startIcon={<SaveIcon />}
                    >
                        Enregistrer
                    </Button>
                </Toolbar>
            </AppBar>

            {saved && (
                <Alert 
                    icon={<CheckCircleIcon />} 
                    severity="success" 
                    sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}
                >
                    Paramètres enregistrés avec succès !
                </Alert>
            )}

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Menu latéral */}
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <List>
                                {menuItems.map((item) => (
                                    <ListItem key={item.tab} disablePadding>
                                        <ListItemButton 
                                            selected={activeTab === item.tab}
                                            onClick={() => setActiveTab(item.tab)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 0.5,
                                                '&.Mui-selected': {
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#1565c0',
                                                    },
                                                    '& .MuiListItemIcon-root': {
                                                        color: 'white',
                                                    }
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ color: activeTab === item.tab ? 'white' : 'inherit' }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.label} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Contenu des paramètres */}
                    <Grid item xs={12} md={9}>
                        <Paper sx={{ p: 3 }}>
                            {/* Onglet Affichage */}
                            {activeTab === 0 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                        <DisplaySettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Affichage
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Langue</InputLabel>
                                                <Select
                                                    value={settings.language}
                                                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                                                    label="Langue"
                                                >
                                                    <MenuItem value="fr">Français</MenuItem>
                                                    <MenuItem value="en">English</MenuItem>
                                                    <MenuItem value="ar">العربية</MenuItem>
                                                    <MenuItem value="es">Español</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Thème</InputLabel>
                                                <Select
                                                    value={settings.theme}
                                                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                                                    label="Thème"
                                                >
                                                    <MenuItem value="light">Clair</MenuItem>
                                                    <MenuItem value="dark">Sombre</MenuItem>
                                                    <MenuItem value="system">Système</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="subtitle1" gutterBottom>Apparence</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.compactMode}
                                                        onChange={(e) => setSettings({...settings, compactMode: e.target.checked})}
                                                    />
                                                }
                                                label="Mode compact (réduit les espaces)"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.animations}
                                                        onChange={(e) => setSettings({...settings, animations: e.target.checked})}
                                                    />
                                                }
                                                label="Activer les animations"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography gutterBottom>Taille de police</Typography>
                                            <RadioGroup
                                                row
                                                value={settings.fontSize}
                                                onChange={(e) => setSettings({...settings, fontSize: e.target.value})}
                                            >
                                                <FormControlLabel value="small" control={<Radio />} label="Petite" />
                                                <FormControlLabel value="medium" control={<Radio />} label="Moyenne" />
                                                <FormControlLabel value="large" control={<Radio />} label="Grande" />
                                            </RadioGroup>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Onglet Notifications */}
                            {activeTab === 1 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                        <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Notifications
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>Types de notifications</Typography>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={settings.emailNotifications}
                                                                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                                                            />
                                                        }
                                                        label="Notifications par email"
                                                    />
                                                    <Box sx={{ mt: 2 }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={settings.smsNotifications}
                                                                    onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                                                                />
                                                            }
                                                            label="Notifications par SMS"
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>Rappels</Typography>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={settings.appointmentReminders}
                                                                onChange={(e) => setSettings({...settings, appointmentReminders: e.target.checked})}
                                                            />
                                                        }
                                                        label="Rappels de rendez-vous"
                                                    />
                                                    <Box sx={{ mt: 2 }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Switch
                                                                    checked={settings.medicalAlerts}
                                                                    onChange={(e) => setSettings({...settings, medicalAlerts: e.target.checked})}
                                                                />
                                                            }
                                                            label="Alertes médicales importantes"
                                                        />
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.soundEnabled}
                                                        onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <VolumeUpIcon sx={{ mr: 1 }} />
                                                        Sons des notifications
                                                    </Box>
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Onglet Sécurité */}
                            {activeTab === 2 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                        <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Sécurité
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="h6" gutterBottom>Authentification</Typography>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={settings.twoFactorAuth}
                                                                onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                                                            />
                                                        }
                                                        label="Double authentification (2FA)"
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Délai d'inactivité (minutes)"
                                                value={settings.sessionTimeout}
                                                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                                                helperText="Déconnexion automatique après inactivité"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Expiration mot de passe (jours)"
                                                value={settings.passwordExpiry}
                                                onChange={(e) => setSettings({...settings, passwordExpiry: parseInt(e.target.value)})}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Tentatives de connexion max"
                                                value={settings.loginAttempts}
                                                onChange={(e) => setSettings({...settings, loginAttempts: parseInt(e.target.value)})}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.auditLogs}
                                                        onChange={(e) => setSettings({...settings, auditLogs: e.target.checked})}
                                                    />
                                                }
                                                label="Activer les journaux d'audit (RGPD)"
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Onglet Médias */}
                            {activeTab === 3 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                        <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Médias & Stockage
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>Qualité des images</InputLabel>
                                                <Select
                                                    value={settings.imageQuality}
                                                    onChange={(e) => setSettings({...settings, imageQuality: e.target.value})}
                                                    label="Qualité des images"
                                                >
                                                    <MenuItem value="low">Basse (économise l'espace)</MenuItem>
                                                    <MenuItem value="medium">Moyenne</MenuItem>
                                                    <MenuItem value="high">Haute</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="h6" gutterBottom>Sauvegarde automatique</Typography>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.autoBackup}
                                                        onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                                                    />
                                                }
                                                label="Activer sauvegarde automatique"
                                            />
                                            {settings.autoBackup && (
                                                <Box sx={{ mt: 2 }}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Fréquence</InputLabel>
                                                        <Select
                                                            value={settings.backupFrequency}
                                                            onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                                                            label="Fréquence"
                                                        >
                                                            <MenuItem value="daily">Quotidienne</MenuItem>
                                                            <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                                            <MenuItem value="monthly">Mensuelle</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography gutterBottom>Limite de stockage (GB)</Typography>
                                            <Slider
                                                value={settings.storageLimit}
                                                onChange={(e, val) => setSettings({...settings, storageLimit: val})}
                                                min={5}
                                                max={100}
                                                step={5}
                                                marks
                                                valueLabelDisplay="auto"
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Onglet Références */}
                            {activeTab === 4 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                        <MedicalServicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Références médicales
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Durée consultation standard (minutes)"
                                                value={settings.consultationDuration}
                                                onChange={(e) => setSettings({...settings, consultationDuration: parseInt(e.target.value)})}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Durée créneau urgence (minutes)"
                                                value={settings.emergencySlotDuration}
                                                onChange={(e) => setSettings({...settings, emergencySlotDuration: parseInt(e.target.value)})}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Rendez-vous max par jour/médecin"
                                                value={settings.maxAppointmentsPerDay}
                                                onChange={(e) => setSettings({...settings, maxAppointmentsPerDay: parseInt(e.target.value)})}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Temps de pause (minutes)"
                                                value={settings.breakTime}
                                                onChange={(e) => setSettings({...settings, breakTime: parseInt(e.target.value)})}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Onglet Système d'administration */}
                            {activeTab === 5 && (
                                <Box>
                                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                        <AdminPanelSettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Système d'administration
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Email administrateur"
                                                type="email"
                                                value={settings.adminEmail}
                                                onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Nom du système"
                                                value={settings.systemName}
                                                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 2 }} />
                                            <Typography variant="h6" gutterBottom>Mode maintenance</Typography>
                                            <Alert severity="warning" sx={{ mb: 2 }}>
                                                ⚠️ Activez le mode maintenance pour effectuer des mises à jour critiques.
                                                Les utilisateurs ne pourront pas accéder au système.
                                            </Alert>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.maintenanceMode}
                                                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                                                        color="warning"
                                                    />
                                                }
                                                label="Mode maintenance"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.debugMode}
                                                        onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
                                                    />
                                                }
                                                label="Mode debug (affiche les erreurs détaillées)"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={settings.autoUpdate}
                                                        onChange={(e) => setSettings({...settings, autoUpdate: e.target.checked})}
                                                    />
                                                }
                                                label="Mises à jour automatiques"
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Boutons d'action */}
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={resetSettings}
                                    startIcon={<RestartAltIcon />}
                                >
                                    Réinitialiser
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={saveSettings}
                                    startIcon={<SaveIcon />}
                                    color="primary"
                                >
                                    Enregistrer tous les paramètres
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

export default Settings;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Switch, 
    FormControlLabel, Divider, Alert, Snackbar, Card, CardContent,
    Avatar, IconButton, Slider, Select, MenuItem, FormControl, InputLabel,
    List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
    Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab,
    ListItemButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PaletteIcon from '@mui/icons-material/Palette';
import BackupIcon from '@mui/icons-material/Backup';
import LanguageIcon from '@mui/icons-material/Language';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleIcon from '@mui/icons-material/People';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import EmailIcon from '@mui/icons-material/Email';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';

function Parametres() {
    const [activeTab, setActiveTab] = useState(0);
    const [saved, setSaved] = useState(false);
    const [openUserDialog, setOpenUserDialog] = useState(false);
    const [users, setUsers] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    // Paramètres généraux
    const [settings, setSettings] = useState({
        hopitalName: 'HOPITAL V6',
        hopitalEmail: 'contact@hopital.com',
        hopitalPhone: '+225 05 55 55 55',
        hopitalAdresse: 'Abidjan, Côte d\'Ivoire',
        theme: 'light',
        primaryColor: '#00bcd4',
        fontSize: 'medium',
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        newUserNotifications: true,
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5,
        autoBackup: true,
        backupFrequency: 'daily',
        retentionDays: 30,
        language: 'fr'
    });

    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role: 'secretaire',
        telephone: ''
    });

    useEffect(() => {
        fetchUsers();
        loadSettings();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('import.meta.env.VITE_API_URL/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            setUsers([
                { id: 1, email: 'admin@hopital.com', nom: 'Admin', prenom: 'System', role: 'admin', telephone: '0612345678' },
                { id: 2, email: 'jean.dupont@hopital.com', nom: 'DUPONT', prenom: 'Jean', role: 'medecin', telephone: '0612345678' },
                { id: 3, email: 'sophie.lebrun@hopital.com', nom: 'LEBRUN', prenom: 'Sophie', role: 'medecin', telephone: '0623456789' },
            ]);
        }
    };

    const loadSettings = () => {
        const savedSettings = localStorage.getItem('hopital_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    };

    const saveSettings = () => {
        localStorage.setItem('hopital_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSnackbar({ open: true, message: 'Paramètres enregistrés', severity: 'success' });
    };

    const resetSettings = () => {
        setSettings({
            hopitalName: 'HOPITAL V6',
            hopitalEmail: 'contact@hopital.com',
            hopitalPhone: '+225 05 55 55 55',
            hopitalAdresse: 'Abidjan, Côte d\'Ivoire',
            theme: 'light',
            primaryColor: '#00bcd4',
            fontSize: 'medium',
            emailNotifications: true,
            smsNotifications: false,
            appointmentReminders: true,
            newUserNotifications: true,
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginAttempts: 5,
            autoBackup: true,
            backupFrequency: 'daily',
            retentionDays: 30,
            language: 'fr'
        });
        setSnackbar({ open: true, message: 'Paramètres réinitialisés', severity: 'info' });
    };

    const handleAddUser = () => {
        if (!newUser.email || !newUser.password || !newUser.nom || !newUser.prenom) {
            setSnackbar({ open: true, message: 'Veuillez remplir tous les champs', severity: 'error' });
            return;
        }
        const newId = users.length + 1;
        setUsers([...users, { ...newUser, id: newId }]);
        setSnackbar({ open: true, message: 'Utilisateur ajouté', severity: 'success' });
        setOpenUserDialog(false);
        setNewUser({ email: '', password: '', nom: '', prenom: '', role: 'secretaire', telephone: '' });
    };

    const handleDeleteUser = (id) => {
        if (window.confirm('Supprimer cet utilisateur ?')) {
            setUsers(users.filter(u => u.id !== id));
            setSnackbar({ open: true, message: 'Utilisateur supprimé', severity: 'success' });
        }
    };

    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': return '#f44336';
            case 'medecin': return '#4caf50';
            case 'secretaire': return '#2196f3';
            default: return '#9e9e9e';
        }
    };

    const getRoleName = (role) => {
        switch(role) {
            case 'admin': return 'Administrateur';
            case 'medecin': return 'Médecin';
            case 'secretaire': return 'Secrétaire';
            default: return role;
        }
    };

    const menuItems = [
        { icon: <AdminPanelSettingsIcon />, label: 'Général', tab: 0 },
        { icon: <PaletteIcon />, label: 'Apparence', tab: 1 },
        { icon: <NotificationsIcon />, label: 'Notifications', tab: 2 },
        { icon: <SecurityIcon />, label: 'Sécurité', tab: 3 },
        { icon: <BackupIcon />, label: 'Base de données', tab: 4 },
        { icon: <PeopleIcon />, label: 'Utilisateurs', tab: 5 },
        { icon: <LanguageIcon />, label: 'Langue', tab: 6 },
    ];

    return (
        <Box>
            {saved && (
                <Alert severity="success" sx={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
                    Paramètres enregistrés !
                </Alert>
            )}

            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                ⚙️ Paramètres
            </Typography>

            <Grid container spacing={3}>
                {/* Menu latéral */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <List component="nav">
                            {menuItems.map((item) => (
                                <ListItemButton 
                                    key={item.tab}
                                    selected={activeTab === item.tab} 
                                    onClick={() => setActiveTab(item.tab)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Contenu */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        {/* Général */}
                        {activeTab === 0 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Informations générales</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Nom de l'hôpital" value={settings.hopitalName} onChange={(e) => setSettings({...settings, hopitalName: e.target.value})} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Email" type="email" value={settings.hopitalEmail} onChange={(e) => setSettings({...settings, hopitalEmail: e.target.value})} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Téléphone" value={settings.hopitalPhone} onChange={(e) => setSettings({...settings, hopitalPhone: e.target.value})} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Adresse" value={settings.hopitalAdresse} onChange={(e) => setSettings({...settings, hopitalAdresse: e.target.value})} multiline rows={2} />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Apparence */}
                        {activeTab === 1 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Apparence</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Thème</InputLabel>
                                            <Select value={settings.theme} onChange={(e) => setSettings({...settings, theme: e.target.value})} label="Thème">
                                                <MenuItem value="light">Clair</MenuItem>
                                                <MenuItem value="dark">Sombre</MenuItem>
                                                <MenuItem value="system">Système</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Taille de police</InputLabel>
                                            <Select value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: e.target.value})} label="Taille de police">
                                                <MenuItem value="small">Petite</MenuItem>
                                                <MenuItem value="medium">Moyenne</MenuItem>
                                                <MenuItem value="large">Grande</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography gutterBottom>Couleur principale</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{ width: 50, height: 50, borderRadius: 2, bgcolor: settings.primaryColor, border: '1px solid #ddd' }} />
                                            <TextField value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Notifications */}
                        {activeTab === 2 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Notifications</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch checked={settings.emailNotifications} onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})} />} label="Notifications par email" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch checked={settings.smsNotifications} onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})} />} label="Notifications par SMS" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch checked={settings.appointmentReminders} onChange={(e) => setSettings({...settings, appointmentReminders: e.target.checked})} />} label="Rappels de rendez-vous" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch checked={settings.newUserNotifications} onChange={(e) => setSettings({...settings, newUserNotifications: e.target.checked})} />} label="Nouveaux utilisateurs" />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Sécurité */}
                        {activeTab === 3 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Sécurité</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch checked={settings.twoFactorAuth} onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})} />} label="Double authentification (2FA)" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="number" label="Délai d'inactivité (minutes)" value={settings.sessionTimeout} onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="number" label="Expiration mot de passe (jours)" value={settings.passwordExpiry} onChange={(e) => setSettings({...settings, passwordExpiry: parseInt(e.target.value)})} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth type="number" label="Tentatives de connexion max" value={settings.loginAttempts} onChange={(e) => setSettings({...settings, loginAttempts: parseInt(e.target.value)})} />
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Base de données */}
                        {activeTab === 4 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Sauvegarde</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControlLabel control={<Switch checked={settings.autoBackup} onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})} />} label="Sauvegarde automatique" />
                                    </Grid>
                                    {settings.autoBackup && (
                                        <>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Fréquence</InputLabel>
                                                    <Select value={settings.backupFrequency} onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})} label="Fréquence">
                                                        <MenuItem value="daily">Quotidienne</MenuItem>
                                                        <MenuItem value="weekly">Hebdomadaire</MenuItem>
                                                        <MenuItem value="monthly">Mensuelle</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth type="number" label="Conservation (jours)" value={settings.retentionDays} onChange={(e) => setSettings({...settings, retentionDays: parseInt(e.target.value)})} />
                                            </Grid>
                                        </>
                                    )}
                                    <Grid item xs={12}>
                                        <Button variant="outlined" startIcon={<BackupIcon />}>Sauvegarder maintenant</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Utilisateurs */}
                        {activeTab === 5 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6">Gestion des utilisateurs</Typography>
                                    <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setOpenUserDialog(true)} sx={{ bgcolor: '#00bcd4' }}>
                                        Ajouter
                                    </Button>
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                {users.map((user) => (
                                    <Card key={user.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>{user.prenom?.charAt(0)}{user.nom?.charAt(0)}</Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle1">{user.prenom} {user.nom}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                                                        <Typography variant="caption" sx={{ color: getRoleColor(user.role) }}>{getRoleName(user.role)}</Typography>
                                                    </Box>
                                                </Box>
                                                {user.role !== 'admin' && (
                                                    <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}

                        {/* Langue */}
                        {activeTab === 6 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>Langue</Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Langue</InputLabel>
                                            <Select value={settings.language} onChange={(e) => setSettings({...settings, language: e.target.value})} label="Langue">
                                                <MenuItem value="fr">Français</MenuItem>
                                                <MenuItem value="en">English</MenuItem>
                                                <MenuItem value="es">Español</MenuItem>
                                                <MenuItem value="ar">العربية</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Boutons */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={resetSettings}>
                                Réinitialiser
                            </Button>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={saveSettings} sx={{ bgcolor: '#00bcd4' }}>
                                Enregistrer
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog Ajout utilisateur */}
            <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#00bcd4', color: 'white' }}>➕ Ajouter un utilisateur</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField fullWidth label="Nom" value={newUser.nom} onChange={(e) => setNewUser({...newUser, nom: e.target.value})} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Prénom" value={newUser.prenom} onChange={(e) => setNewUser({...newUser, prenom: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Mot de passe" type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Téléphone" value={newUser.telephone} onChange={(e) => setNewUser({...newUser, telephone: e.target.value})} /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Rôle</InputLabel>
                                <Select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} label="Rôle">
                                    <MenuItem value="admin">Administrateur</MenuItem>
                                    <MenuItem value="medecin">Médecin</MenuItem>
                                    <MenuItem value="secretaire">Secrétaire</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUserDialog(false)}>Annuler</Button>
                    <Button onClick={handleAddUser} variant="contained" sx={{ bgcolor: '#00bcd4' }}>Ajouter</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}

export default Parametres;

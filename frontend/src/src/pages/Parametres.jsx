import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Switch, FormControlLabel, Divider, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

function Parametres() {
    const [settings, setSettings] = useState({ notifications: true, theme: 'light', language: 'fr', email: 'admin@hopital.com' });
    const [saved, setSaved] = useState(false);

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

    return (
        <Box><Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Paramètres</Typography>
            {saved && <Alert severity="success" sx={{ mb: 2 }}>Paramètres enregistrés</Alert>}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>Préférences générales</Typography>
                <Grid container spacing={3}><Grid item xs={12}><FormControlLabel control={<Switch checked={settings.notifications} onChange={(e) => setSettings({...settings, notifications: e.target.checked})} />} label="Notifications" /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Email admin" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} /></Grid>
                <Divider sx={{ my: 2 }} /><Grid item xs={12}><Box sx={{ display: 'flex', gap: 2 }}><Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ bgcolor: '#00bcd4' }}>Enregistrer</Button><Button variant="outlined" startIcon={<RestartAltIcon />}>Réinitialiser</Button></Box></Grid></Grid>
            </Paper>
        </Box>
    );
}
export default Parametres;

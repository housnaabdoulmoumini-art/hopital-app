import React, { useState, useEffect } from 'react';
import {
    Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, TextField, Box, IconButton, AppBar, Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

function PatientsList() {
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('import.meta.env.VITE_API_URL/api/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.nom.toLowerCase().includes(search.toLowerCase()) ||
        patient.prenom.toLowerCase().includes(search.toLowerCase()) ||
        patient.nss?.includes(search)
    );

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => navigate('/')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Liste des Patients
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/patients/nouveau')}>
                        <AddIcon /> Nouveau Patient
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Paper sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                        <TextField
                            fullWidth
                            label="Rechercher un patient"
                            variant="outlined"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Box>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>Prénom</TableCell>
                                <TableCell>NSS</TableCell>
                                <TableCell>Téléphone</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPatients.map((patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell>{patient.nom}</TableCell>
                                    <TableCell>{patient.prenom}</TableCell>
                                    <TableCell>{patient.nss}</TableCell>
                                    <TableCell>{patient.telephone}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/patients/${patient.id}`)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => navigate(`/patients/${patient.id}/edit`)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </>
    );
}

export default PatientsList;

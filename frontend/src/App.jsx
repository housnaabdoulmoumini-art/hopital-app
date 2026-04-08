import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import MainLayout from './layouts/MainLayout';
import Accueil from './pages/Accueil';
import Patients from './pages/Patients';
import RendezVous from './pages/RendezVous';
import Medecins from './pages/Medecins';
import Stats from './pages/Stats';
import Parametres from './pages/Parametres';
import PatientPortal from './pages/PatientPortal';
import ExamResults from './pages/ExamResults';
import DoctorAppointments from './pages/DoctorAppointments';
import Ordonnances from './pages/Ordonnances';
import Factures from './pages/Factures';
import Hospitalisations from './pages/Hospitalisations';
import axios from 'axios';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#00bcd4' },
        background: { default: '#f5f5f5' }
    },
    typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
                    
                    <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
                        <Route index element={<Accueil />} />
                        <Route path="accueil" element={<Accueil />} />
                        <Route path="patients" element={<Patients />} />
                        <Route path="rendez-vous" element={<RendezVous />} />
                        <Route path="medecins" element={<Medecins />} />
                        <Route path="stats" element={<Stats />} />
                        <Route path="parametres" element={<Parametres />} />
                        <Route path="patient-portal" element={<PatientPortal />} />
                        <Route path="exam-results" element={<ExamResults />} />
                        <Route path="doctor-appointments" element={<DoctorAppointments />} />
                        <Route path="ordonnances" element={<Ordonnances />} />
                        <Route path="factures" element={<Factures />} />
                        <Route path="hospitalisations" element={<Hospitalisations />} />
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;

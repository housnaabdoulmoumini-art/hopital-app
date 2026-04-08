import React, { useState, useRef } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, TextField,
    Button, Chip, Avatar, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Alert, Tabs, Tab, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ScienceIcon from '@mui/icons-material/Science';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

function ExamResults() {
    const [searchNss, setSearchNss] = useState('');
    const [patient, setPatient] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [error, setError] = useState('');
    const printRef = useRef();

    // Données des patients
    const patientsData = {
        '123456789012345': {
            id: 1,
            nom: 'DUPONT',
            prenom: 'Marie',
            nss: '123456789012345',
            date_naissance: '1985-03-15',
            telephone: '0612345678',
            email: 'marie.dupont@email.com',
            groupe_sanguin: 'A+',
            examens: [
                {
                    id: 1,
                    type: 'Prise de sang',
                    date: '2024-01-10',
                    medecin: 'Dr. Jean DUPONT',
                    resultats: {
                        'Globules blancs': '7.5 G/L (Normale: 4-10)',
                        'Globules rouges': '4.8 T/L (Normale: 4-5.5)',
                        'Hémoglobine': '14 g/dL (Normale: 12-16)',
                        'Plaquettes': '250 G/L (Normale: 150-400)'
                    },
                    conclusion: 'Résultats dans les normes'
                },
                {
                    id: 2,
                    type: 'Radiologie - Radio thorax',
                    date: '2024-01-05',
                    medecin: 'Dr. Sophie LEBRUN',
                    resultats: {
                        'Observations': 'Champs pulmonaires clairs, silhouette cardiaque normale'
                    },
                    conclusion: 'Pas d\'anomalie détectée'
                },
                {
                    id: 3,
                    type: 'Échographie abdominale',
                    date: '2023-12-15',
                    medecin: 'Dr. Marie BERNARD',
                    resultats: {
                        'Foie': 'Taille normale, homogène',
                        'Reins': 'Normaux',
                        'Rate': 'Normale'
                    },
                    conclusion: 'Examen sans anomalie'
                }
            ]
        },
        '234567890123456': {
            id: 2,
            nom: 'MARTIN',
            prenom: 'Jean',
            nss: '234567890123456',
            date_naissance: '1990-07-22',
            telephone: '0623456789',
            email: 'jean.martin@email.com',
            groupe_sanguin: 'O+',
            examens: [
                {
                    id: 1,
                    type: 'Analyse d\'urine',
                    date: '2024-01-08',
                    medecin: 'Dr. Pierre MARTIN',
                    resultats: {
                        'Aspect': 'Clair',
                        'Densité': '1.020',
                        'pH': '6.5',
                        'Protéines': 'Absentes'
                    },
                    conclusion: 'Analyse normale'
                },
                {
                    id: 2,
                    type: 'Électrocardiogramme (ECG)',
                    date: '2024-01-02',
                    medecin: 'Dr. Jean DUPONT',
                    resultats: {
                        'Rythme': 'Sinus régulier',
                        'Fréquence': '72 bpm',
                        'Segment ST': 'Normal'
                    },
                    conclusion: 'ECG normal'
                }
            ]
        }
    };

    // Rechercher patient par NSS
    const searchPatient = () => {
        if (!searchNss) {
            setError('Veuillez entrer un numéro NSS');
            setPatient(null);
            setExamResults([]);
            return;
        }
        
        const foundPatient = patientsData[searchNss];
        
        if (foundPatient) {
            setPatient(foundPatient);
            setExamResults(foundPatient.examens);
            setError('');
        } else {
            setPatient(null);
            setExamResults([]);
            setError('Aucun patient trouvé. Essayez: 123456789012345 ou 234567890123456');
        }
    };

    // Fonction d'impression
    const handlePrint = (exam) => {
        setSelectedExam(exam);
        setOpenPrintDialog(true);
    };

    const printExam = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    // Génération PDF (via impression)
    const handlePDF = (exam) => {
        setSelectedExam(exam);
        setTimeout(() => {
            const printContent = printRef.current.innerHTML;
            const originalContent = document.body.innerHTML;
            
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
        }, 100);
    };

    const getExamIcon = (type) => {
        if (type.includes('sang') || type.includes('Prise')) return <BloodtypeIcon />;
        if (type.includes('Radio')) return <MonitorHeartIcon />;
        if (type.includes('Écho')) return <MonitorHeartIcon />;
        if (type.includes('ECG')) return <MonitorHeartIcon />;
        if (type.includes('urine')) return <ScienceIcon />;
        return <ScienceIcon />;
    };

    const filteredExams = examResults.filter(exam => {
        if (tabValue === 0) return true;
        if (tabValue === 1) return exam.type.includes('sang') || exam.type.includes('urine');
        if (tabValue === 2) return exam.type.includes('Radio') || exam.type.includes('Écho') || exam.type.includes('ECG');
        return true;
    });

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* En-tête */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#1976d2', color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    🔬 Résultats d'examens médicaux
                </Typography>
                <Typography variant="body1">
                    Consultez vos résultats d'analyses et examens en ligne
                </Typography>
            </Paper>

            {/* Recherche patient par NSS */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>Rechercher mes résultats</Typography>
                <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Numéro de Sécurité Sociale (NSS)"
                            value={searchNss}
                            onChange={(e) => setSearchNss(e.target.value)}
                            placeholder="Entrez votre numéro NSS à 15 chiffres"
                            helperText="Exemples: 123456789012345 ou 234567890123456"
                            onKeyPress={(e) => e.key === 'Enter' && searchPatient()}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button 
                            fullWidth 
                            variant="contained" 
                            startIcon={<SearchIcon />}
                            onClick={searchPatient}
                            sx={{ bgcolor: '#00bcd4', py: 1.5, '&:hover': { bgcolor: '#00acc1' } }}
                        >
                            Rechercher
                        </Button>
                    </Grid>
                </Grid>
                
                {error && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>

            {/* Informations patient */}
            {patient && (
                <>
                    <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: '#e3f2fd' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Avatar sx={{ bgcolor: '#1976d2', width: 60, height: 60 }}>
                                <PersonIcon sx={{ fontSize: 35 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{patient.prenom} {patient.nom}</Typography>
                                <Typography variant="body2">Né le: {new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</Typography>
                                <Typography variant="body2">Groupe sanguin: <Chip label={patient.groupe_sanguin} size="small" color="primary" /></Typography>
                            </Box>
                            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                                <Typography variant="body2"><strong>NSS:</strong> {patient.nss}</Typography>
                                <Typography variant="body2"><strong>Tél:</strong> {patient.telephone}</Typography>
                                <Typography variant="body2"><strong>Email:</strong> {patient.email}</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Tabs filtres */}
                    <Paper sx={{ borderRadius: 3, mb: 3 }}>
                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }}>
                            <Tab label="📋 Tous les examens" />
                            <Tab label="🧪 Analyses biologiques" />
                            <Tab label="🩻 Imagerie médicale" />
                        </Tabs>
                    </Paper>

                    {/* Liste des résultats */}
                    {filteredExams.length === 0 ? (
                        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                            <Typography color="text.secondary">Aucun examen trouvé dans cette catégorie</Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredExams.map((exam) => (
                                <Grid item xs={12} md={6} key={exam.id}>
                                    <Card sx={{ borderRadius: 3, '&:hover': { boxShadow: 6 } }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}>
                                                        {getExamIcon(exam.type)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6">{exam.type}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            <CalendarTodayIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                                            {new Date(exam.date).toLocaleDateString('fr-FR')}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Chip label="Disponible" size="small" color="success" />
                                            </Box>
                                            
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Médecin: {exam.medecin}
                                            </Typography>
                                            
                                            <Divider sx={{ my: 1.5 }} />
                                            
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Résultats:</strong>
                                            </Typography>
                                            {Object.entries(exam.resultats).slice(0, 3).map(([key, value]) => (
                                                <Typography key={key} variant="body2" sx={{ ml: 2 }}>
                                                    • {key}: {value}
                                                </Typography>
                                            ))}
                                            {Object.keys(exam.resultats).length > 3 && (
                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                                    +{Object.keys(exam.resultats).length - 3} autres résultats
                                                </Typography>
                                            )}
                                            
                                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => { setSelectedExam(exam); setOpenDialog(true); }}
                                                >
                                                    Voir détails
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<PictureAsPdfIcon />}
                                                    onClick={() => handlePDF(exam)}
                                                >
                                                    PDF
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    startIcon={<PrintIcon />}
                                                    onClick={() => handlePrint(exam)}
                                                >
                                                    Imprimer
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {/* Dialog détail examen */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    Détail de l'examen - {selectedExam?.type}
                </DialogTitle>
                <DialogContent>
                    {selectedExam && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Date: {new Date(selectedExam.date).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Médecin: {selectedExam.medecin}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="h6" gutterBottom>Résultats détaillés</Typography>
                            
                            {Object.entries(selectedExam.resultats).map(([key, value]) => (
                                <Paper key={key} sx={{ p: 2, mb: 2, bgcolor: '#f9f9f9' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        {key}:
                                    </Typography>
                                    <Typography variant="body2">{value}</Typography>
                                </Paper>
                            ))}
                            
                            {selectedExam.conclusion && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <strong>Conclusion:</strong> {selectedExam.conclusion}
                                </Alert>
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<PrintIcon />}
                                    onClick={() => handlePrint(selectedExam)}
                                    sx={{ bgcolor: '#00bcd4' }}
                                >
                                    Imprimer
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<PictureAsPdfIcon />}
                                    onClick={() => handlePDF(selectedExam)}
                                >
                                    Générer PDF
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Impression / PDF */}
            <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
                    🖨️ Aperçu du résultat d'examen
                </DialogTitle>
                <DialogContent>
                    {selectedExam && (
                        <Box ref={printRef} sx={{ p: 4, fontFamily: 'Arial, sans-serif' }}>
                            {/* En-tête */}
                            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #333', pb: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>HOPITAL V6</Typography>
                                <Typography variant="body2">Centre Hospitalier</Typography>
                                <Typography variant="body2">Tél: 01 23 45 67 89</Typography>
                                <Typography variant="body2">Email: contact@hopital.com</Typography>
                            </Box>

                            {/* Infos patient */}
                            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Patient :</Typography>
                                <Typography>{patient?.prenom} {patient?.nom}</Typography>
                                <Typography>Né le: {patient?.date_naissance && new Date(patient.date_naissance).toLocaleDateString('fr-FR')}</Typography>
                                <Typography>NSS: {patient?.nss}</Typography>
                            </Box>

                            {/* Infos examen */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedExam.type}</Typography>
                                <Typography>Date de l'examen: {new Date(selectedExam.date).toLocaleDateString('fr-FR')}</Typography>
                                <Typography>Médecin prescripteur: {selectedExam.medecin}</Typography>
                            </Box>

                            {/* Résultats */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: '1px solid #333', mb: 2 }}>Résultats détaillés</Typography>
                                {Object.entries(selectedExam.resultats).map(([key, value]) => (
                                    <Box key={key} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{key} :</Typography>
                                        <Typography sx={{ ml: 2 }}>{value}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Conclusion */}
                            {selectedExam.conclusion && (
                                <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Conclusion médicale :</Typography>
                                    <Typography>{selectedExam.conclusion}</Typography>
                                </Box>
                            )}

                            {/* Signature */}
                            <Box sx={{ mt: 5, textAlign: 'right' }}>
                                <Typography>Fait à {new Date().toLocaleDateString('fr-FR')}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography>Signature du médecin</Typography>
                                    <Box sx={{ borderTop: '1px solid #333', width: '200px', mt: 1, ml: 'auto' }} />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPrintDialog(false)}>Fermer</Button>
                    <Button onClick={printExam} variant="contained" startIcon={<PrintIcon />} sx={{ bgcolor: '#1976d2' }}>
                        Imprimer
                    </Button>
                    <Button onClick={printExam} variant="contained" startIcon={<PictureAsPdfIcon />} sx={{ bgcolor: '#f44336' }}>
                        Générer PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ExamResults;

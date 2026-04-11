const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const facturesRoutes = require("./routes/factures");
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
    user: 'hopital_user',
    host: 'localhost',
    database: 'hopital_db',
    password: 'MotDePasse123',
    port: 5432,
});

// Test connexion
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erreur PostgreSQL:', err.message);
    } else {
        console.log('✅ PostgreSQL connecté');
        release();
    }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    
    try {
        const decoded = jwt.verify(token, 'secret_key_2024');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
};

// ============ ROUTES PUBLIQUES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API fonctionnelle', timestamp: new Date() });
});

// INITIALISATION
app.post('/api/init', async (req, res) => {
    try {
        console.log('🔄 Initialisation...');
        
        // Créer les tables
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                telephone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS patients (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                nss VARCHAR(15),
                date_naissance DATE,
                telephone VARCHAR(20),
                email VARCHAR(255),
                adresse TEXT,
                groupe_sanguin VARCHAR(3),
                allergies TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS medecins (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(100) NOT NULL,
                prenom VARCHAR(100) NOT NULL,
                specialite VARCHAR(100),
                numero_ordre VARCHAR(20),
                telephone VARCHAR(20),
                email VARCHAR(255),
                disponibilite VARCHAR(20) DEFAULT 'disponible',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rendez_vous (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id),
                medecin_id INTEGER REFERENCES medecins(id),
                date_heure TIMESTAMP NOT NULL,
                duree INTEGER DEFAULT 20,
                motif TEXT,
                statut VARCHAR(20) DEFAULT 'en_attente',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ordonnances (
                id SERIAL PRIMARY KEY,
                patient_id INTEGER REFERENCES patients(id),
                medecin_id INTEGER REFERENCES medecins(id),
                date_creation DATE DEFAULT CURRENT_DATE,
                diagnostic TEXT,
                recommandations TEXT,
                statut VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ordonnance_medicaments (
                id SERIAL PRIMARY KEY,
                ordonnance_id INTEGER REFERENCES ordonnances(id) ON DELETE CASCADE,
                nom VARCHAR(255) NOT NULL,
                dosage VARCHAR(100),
                duree VARCHAR(100),
                instructions TEXT
            )
        `);
        
        // Créer l'admin
        const passwordHash = await bcrypt.hash('admin123', 10);
        await pool.query("DELETE FROM users WHERE email = 'admin@hopital.com'");
        await pool.query(`
            INSERT INTO users (email, password_hash, nom, prenom, role, telephone)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, ['admin@hopital.com', passwordHash, 'Admin', 'System', 'admin', '0612345678']);
        
        // Ajouter des médecins test
        await pool.query(`
            INSERT INTO medecins (nom, prenom, specialite, numero_ordre, telephone, email)
            SELECT 'DUPONT', 'Jean', 'Cardiologue', '01', '0612345678', 'jean.dupont@hopital.com'
            WHERE NOT EXISTS (SELECT 1 FROM medecins WHERE numero_ordre = '01')
        `);
        await pool.query(`
            INSERT INTO medecins (nom, prenom, specialite, numero_ordre, telephone, email)
            SELECT 'LEBRUN', 'Sophie', 'Pédiatre', '02', '0623456789', 'sophie.lebrun@hopital.com'
            WHERE NOT EXISTS (SELECT 1 FROM medecins WHERE numero_ordre = '02')
        `);
        
        // Ajouter des patients test
        await pool.query(`
            INSERT INTO patients (nom, prenom, nss, telephone, email, groupe_sanguin)
            SELECT 'DUPONT', 'Marie', '123456789012345', '0612345678', 'marie@email.com', 'A+'
            WHERE NOT EXISTS (SELECT 1 FROM patients WHERE nss = '123456789012345')
        `);
        
        console.log('✅ Initialisation terminée');
        res.json({ success: true, message: 'Base initialisée', credentials: { email: 'admin@hopital.com', password: 'admin123' } });
    } catch (error) {
        console.error('Erreur init:', error);
        res.status(500).json({ error: error.message });
    }
});

// LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('📝 Tentative login:', email);
        
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            'secret_key_2024',
            { expiresIn: '24h' }
        );
        
        console.log('✅ Login réussi:', email);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                telephone: user.telephone
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ CRUD PATIENTS ============
app.get('/api/patients', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patients ORDER BY nom');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/patients', authenticateToken, async (req, res) => {
    try {
        const { nom, prenom, nss, date_naissance, email, telephone, adresse, groupe_sanguin, allergies } = req.body;
        const result = await pool.query(
            `INSERT INTO patients (nom, prenom, nss, date_naissance, email, telephone, adresse, groupe_sanguin, allergies)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [nom, prenom, nss, date_naissance, email, telephone, adresse, groupe_sanguin, allergies]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur POST patient:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/patients/:id', authenticateToken, async (req, res) => {
    try {
        const { nom, prenom, nss, date_naissance, email, telephone, adresse, groupe_sanguin, allergies } = req.body;
        const result = await pool.query(
            `UPDATE patients SET nom=$1, prenom=$2, nss=$3, date_naissance=$4, email=$5, telephone=$6, adresse=$7, groupe_sanguin=$8, allergies=$9
             WHERE id=$10 RETURNING *`,
            [nom, prenom, nss, date_naissance, email, telephone, adresse, groupe_sanguin, allergies, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/patients/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM patients WHERE id = $1', [req.params.id]);
        res.json({ message: 'Patient supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ CRUD MEDECINS ============
app.get('/api/medecins', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM medecins ORDER BY numero_ordre');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/medecins', authenticateToken, async (req, res) => {
    try {
        const { nom, prenom, specialite, numero_ordre, telephone, email, disponibilite } = req.body;
        const result = await pool.query(
            `INSERT INTO medecins (nom, prenom, specialite, numero_ordre, telephone, email, disponibilite)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nom, prenom, specialite, numero_ordre || `0${Math.floor(Math.random() * 90) + 10}`, telephone, email, disponibilite || 'disponible']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur POST medecin:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/medecins/:id', authenticateToken, async (req, res) => {
    try {
        const { nom, prenom, specialite, telephone, email, disponibilite } = req.body;
        const result = await pool.query(
            `UPDATE medecins SET nom=$1, prenom=$2, specialite=$3, telephone=$4, email=$5, disponibilite=$6
             WHERE id=$7 RETURNING *`,
            [nom, prenom, specialite, telephone, email, disponibilite, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/medecins/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM medecins WHERE id = $1', [req.params.id]);
        res.json({ message: 'Médecin supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ CRUD RENDEZ-VOUS ============
app.get('/api/rendez-vous', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom,
                   m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite
            FROM rendez_vous r
            LEFT JOIN patients p ON r.patient_id = p.id
            LEFT JOIN medecins m ON r.medecin_id = m.id
            ORDER BY r.date_heure DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rendez-vous', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, date_heure, duree, motif, notes } = req.body;
        console.log('📝 Création RDV:', { patient_id, medecin_id, date_heure });
        
        const result = await pool.query(
            `INSERT INTO rendez_vous (patient_id, medecin_id, date_heure, duree, motif, notes)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [patient_id, medecin_id, date_heure, duree || 20, motif, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur POST RDV:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/rendez-vous/:id', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, date_heure, duree, motif, notes } = req.body;
        const result = await pool.query(
            `UPDATE rendez_vous SET patient_id=$1, medecin_id=$2, date_heure=$3, duree=$4, motif=$5, notes=$6
             WHERE id=$7 RETURNING *`,
            [patient_id, medecin_id, date_heure, duree, motif, notes, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/rendez-vous/:id/status', authenticateToken, async (req, res) => {
    try {
        const { statut } = req.body;
        const result = await pool.query(
            `UPDATE rendez_vous SET statut = $1 WHERE id = $2 RETURNING *`,
            [statut, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/rendez-vous/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM rendez_vous WHERE id = $1', [req.params.id]);
        res.json({ message: 'Rendez-vous supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ CRUD ORDONNANCES ============
app.get('/api/ordonnances', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom,
                   m.nom as medecin_nom, m.prenom as medecin_prenom, m.specialite
            FROM ordonnances o
            LEFT JOIN patients p ON o.patient_id = p.id
            LEFT JOIN medecins m ON o.medecin_id = m.id
            ORDER BY o.date_creation DESC
        `);
        
        for (let ordonnance of result.rows) {
            const meds = await pool.query(
                'SELECT * FROM ordonnance_medicaments WHERE ordonnance_id = $1',
                [ordonnance.id]
            );
            ordonnance.medicaments = meds.rows;
        }
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ordonnances', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, diagnostic, recommandations, medicaments } = req.body;
        console.log('📝 Création ordonnance:', { patient_id, medecin_id, diagnostic });
        
        const result = await pool.query(
            `INSERT INTO ordonnances (patient_id, medecin_id, diagnostic, recommandations)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [patient_id, medecin_id, diagnostic, recommandations]
        );
        
        const ordonnanceId = result.rows[0].id;
        
        if (medicaments && medicaments.length > 0) {
            for (const med of medicaments) {
                if (med.nom) {
                    await pool.query(
                        `INSERT INTO ordonnance_medicaments (ordonnance_id, nom, dosage, duree, instructions)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [ordonnanceId, med.nom, med.dosage, med.duree, med.instructions]
                    );
                }
            }
        }
        
        res.status(201).json({ success: true, message: 'Ordonnance créée', ordonnance: result.rows[0] });
    } catch (error) {
        console.error('Erreur POST ordonnance:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/ordonnances/:id', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, diagnostic, recommandations, medicaments } = req.body;
        const id = req.params.id;
        
        await pool.query(
            `UPDATE ordonnances SET patient_id=$1, medecin_id=$2, diagnostic=$3, recommandations=$4
             WHERE id=$5`,
            [patient_id, medecin_id, diagnostic, recommandations, id]
        );
        
        await pool.query('DELETE FROM ordonnance_medicaments WHERE ordonnance_id = $1', [id]);
        
        if (medicaments && medicaments.length > 0) {
            for (const med of medicaments) {
                if (med.nom) {
                    await pool.query(
                        `INSERT INTO ordonnance_medicaments (ordonnance_id, nom, dosage, duree, instructions)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [id, med.nom, med.dosage, med.duree, med.instructions]
                    );
                }
            }
        }
        
        res.json({ success: true, message: 'Ordonnance modifiée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/ordonnances/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM ordonnances WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Ordonnance supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Init DB: http://localhost:${PORT}/api/init`);
    console.log(`🔐 Login: http://localhost:${PORT}/api/login\n`);
});

// ============ INSCRIPTION (REGISTER) ============
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, nom, prenom, telephone, role } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Hacher le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Insérer le nouvel utilisateur (rôle par défaut 'patient' si non spécifié)
        const userRole = role || 'patient';
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, nom, prenom, role, telephone)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, nom, prenom, role`,
            [email, passwordHash, nom, prenom, userRole, telephone || null]
        );

        res.status(201).json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});


// ============ CRUD FACTURES ============

// Récupérer toutes les factures
app.get('/api/factures', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom, p.telephone as patient_telephone, p.email as patient_email
            FROM factures f
            LEFT JOIN patients p ON f.patient_id = p.id
            ORDER BY f.date_emission DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur GET factures:', error);
        res.status(500).json({ error: error.message });
    }
});

// Récupérer une facture par ID
app.get('/api/factures/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom, p.telephone as patient_telephone, p.email as patient_email, p.adresse as patient_adresse
            FROM factures f
            LEFT JOIN patients p ON f.patient_id = p.id
            WHERE f.id = $1
        `, [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Créer une facture
app.post('/api/factures', authenticateToken, async (req, res) => {
    try {
        const { patient_id, lignes, montant_ht, montant_ttc, date_echeance } = req.body;
        
        // Générer un numéro de facture unique
        const annee = new Date().getFullYear();
        const count = await pool.query('SELECT COUNT(*) FROM factures');
        const numero = `FAC-${annee}-${String(parseInt(count.rows[0].count) + 1).padStart(3, '0')}`;
        
        const result = await pool.query(
            `INSERT INTO factures (numero, patient_id, date_echeance, montant_ht, montant_ttc, lignes, statut)
             VALUES ($1, $2, $3, $4, $5, $6, 'en_attente') RETURNING *`,
            [numero, patient_id, date_echeance, montant_ht, montant_ttc, JSON.stringify(lignes)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur POST facture:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour le statut d'une facture
app.patch('/api/factures/:id/status', authenticateToken, async (req, res) => {
    try {
        const { statut } = req.body;
        const result = await pool.query(
            `UPDATE factures SET statut = $1 WHERE id = $2 RETURNING *`,
            [statut, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer une facture
app.delete('/api/factures/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM factures WHERE id = $1', [req.params.id]);
        res.json({ message: 'Facture supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============ CRUD FACTURES ============

// Récupérer toutes les factures
app.get('/api/factures', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT f.*, 
                   p.nom as patient_nom, p.prenom as patient_prenom
            FROM factures f
            LEFT JOIN patients p ON f.patient_id = p.id
            ORDER BY f.date_emission DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur GET factures:', error);
        res.status(500).json({ error: error.message });
    }
});

// Créer une facture
app.post('/api/factures', authenticateToken, async (req, res) => {
    try {
        const { patient_id, lignes, montant_ht, montant_ttc, date_echeance, emetteur_id, emetteur_type, emetteur_nom } = req.body;
        
        // Générer un numéro de facture
        const annee = new Date().getFullYear();
        const count = await pool.query('SELECT COUNT(*) FROM factures');
        const numero = `FAC-${annee}-${String(parseInt(count.rows[0].count) + 1).padStart(3, '0')}`;
        
        const result = await pool.query(
            `INSERT INTO factures (numero, patient_id, date_echeance, montant_ht, montant_ttc, lignes, statut, emetteur_id, emetteur_type, emetteur_nom)
             VALUES ($1, $2, $3, $4, $5, $6, 'en_attente', $7, $8, $9) RETURNING *`,
            [numero, patient_id, date_echeance, montant_ht, montant_ttc, JSON.stringify(lignes), emetteur_id, emetteur_type, emetteur_nom]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erreur POST facture:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mettre à jour le statut d'une facture
app.patch('/api/factures/:id/status', authenticateToken, async (req, res) => {
    try {
        const { statut } = req.body;
        const result = await pool.query(
            `UPDATE factures SET statut = $1 WHERE id = $2 RETURNING *`,
            [statut, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============ CRUD ORDONNANCES COMPLET ============

// Créer une ordonnance
app.post('/api/ordonnances', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, diagnostic, recommandations, medicaments } = req.body;
        
        console.log('📝 Création ordonnance:', { patient_id, medecin_id, diagnostic });
        
        // Vérifier que le patient et le médecin existent
        const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }
        
        const medecinCheck = await pool.query('SELECT id FROM medecins WHERE id = $1', [medecin_id]);
        if (medecinCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Médecin non trouvé' });
        }
        
        const result = await pool.query(
            `INSERT INTO ordonnances (patient_id, medecin_id, diagnostic, recommandations, statut)
             VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
            [patient_id, medecin_id, diagnostic, recommandations]
        );
        
        const ordonnanceId = result.rows[0].id;
        
        if (medicaments && medicaments.length > 0) {
            for (const med of medicaments) {
                if (med.nom) {
                    await pool.query(
                        `INSERT INTO ordonnance_medicaments (ordonnance_id, nom, dosage, duree, instructions)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [ordonnanceId, med.nom, med.dosage, med.duree, med.instructions]
                    );
                }
            }
        }
        
        res.status(201).json({ success: true, message: 'Ordonnance créée', ordonnance: result.rows[0] });
    } catch (error) {
        console.error('Erreur POST ordonnance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Modifier une ordonnance
app.put('/api/ordonnances/:id', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, diagnostic, recommandations, medicaments } = req.body;
        const id = req.params.id;
        
        await pool.query(
            `UPDATE ordonnances SET patient_id=$1, medecin_id=$2, diagnostic=$3, recommandations=$4
             WHERE id=$5`,
            [patient_id, medecin_id, diagnostic, recommandations, id]
        );
        
        // Supprimer les anciens médicaments
        await pool.query('DELETE FROM ordonnance_medicaments WHERE ordonnance_id = $1', [id]);
        
        // Insérer les nouveaux médicaments
        if (medicaments && medicaments.length > 0) {
            for (const med of medicaments) {
                if (med.nom) {
                    await pool.query(
                        `INSERT INTO ordonnance_medicaments (ordonnance_id, nom, dosage, duree, instructions)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [id, med.nom, med.dosage, med.duree, med.instructions]
                    );
                }
            }
        }
        
        res.json({ success: true, message: 'Ordonnance modifiée' });
    } catch (error) {
        console.error('Erreur PUT ordonnance:', error);
        res.status(500).json({ error: error.message });
    }
});

// Supprimer une ordonnance
app.delete('/api/ordonnances/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM ordonnances WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Ordonnance supprimée' });
    } catch (error) {
        console.error('Erreur DELETE ordonnance:', error);
        res.status(500).json({ error: error.message });
    }
});


// ============ CRUD FACTURES COMPLET ============

// Créer une facture
app.post('/api/factures', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, montant_ht, montant_ttc, date_echeance, description } = req.body;
        
        console.log('📝 Création facture:', { patient_id, medecin_id, montant_ht });
        
        // Vérifier que le patient et le médecin existent
        const patientCheck = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
        if (patientCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Patient non trouvé' });
        }
        
        const medecinCheck = await pool.query('SELECT id FROM medecins WHERE id = $1', [medecin_id]);
        if (medecinCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Médecin non trouvé' });
        }
        
        // Générer un numéro de facture unique
        const annee = new Date().getFullYear();
        const count = await pool.query('SELECT COUNT(*) FROM factures');
        const numero = `FAC-${annee}-${String(parseInt(count.rows[0].count) + 1).padStart(3, '0')}`;
        
        const result = await pool.query(
            `INSERT INTO factures (numero, patient_id, medecin_id, date_echeance, montant_ht, montant_ttc, description, statut)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_attente') RETURNING *`,
            [numero, patient_id, medecin_id, date_echeance, montant_ht, montant_ttc, description]
        );
        
        res.status(201).json({ success: true, message: 'Facture créée', facture: result.rows[0] });
    } catch (error) {
        console.error('Erreur POST facture:', error);
        res.status(500).json({ error: error.message });
    }
});

// Modifier une facture
app.put('/api/factures/:id', authenticateToken, async (req, res) => {
    try {
        const { patient_id, medecin_id, montant_ht, montant_ttc, date_echeance, description, statut } = req.body;
        const id = req.params.id;
        
        const result = await pool.query(
            `UPDATE factures SET patient_id=$1, medecin_id=$2, montant_ht=$3, montant_ttc=$4, date_echeance=$5, description=$6, statut=$7
             WHERE id=$8 RETURNING *`,
            [patient_id, medecin_id, montant_ht, montant_ttc, date_echeance, description, statut, id]
        );
        
        res.json({ success: true, message: 'Facture modifiée', facture: result.rows[0] });
    } catch (error) {
        console.error('Erreur PUT facture:', error);
        res.status(500).json({ error: error.message });
    }
});


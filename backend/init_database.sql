-- Supprimer les tables existantes (ordre inverse pour éviter les clés étrangères)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS examens_resultats CASCADE;
DROP TABLE IF EXISTS rendez_vous CASCADE;
DROP TABLE IF EXISTS dossiers_medicaux CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS medecins CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS logs_audit CASCADE;

-- Table des utilisateurs (authentification)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'medecin', 'secretaire', 'patient')),
    telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Table des médecins
CREATE TABLE medecins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    specialite VARCHAR(100) NOT NULL,
    numero_ordre VARCHAR(20) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse TEXT,
    disponibilite VARCHAR(20) DEFAULT 'disponible' CHECK (disponibilite IN ('disponible', 'occupe', 'conges')),
    consultation_duree INTEGER DEFAULT 20,
    consultation_prix DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des patients
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nss VARCHAR(15) UNIQUE NOT NULL,
    date_naissance DATE NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255),
    adresse TEXT,
    groupe_sanguin VARCHAR(3) CHECK (groupe_sanguin IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT,
    mutuelle VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des rendez-vous
CREATE TABLE rendez_vous (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id INTEGER REFERENCES medecins(id) ON DELETE CASCADE,
    date_heure TIMESTAMP NOT NULL,
    duree_minutes INTEGER DEFAULT 20,
    motif TEXT,
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirme', 'termine', 'annule', 'rejete')),
    notes TEXT,
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rappel_envoye BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des dossiers médicaux
CREATE TABLE dossiers_medicaux (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id INTEGER REFERENCES medecins(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'prescription', 'resultat_analyse', 'hospitalisation', 'vaccination', 'certificat')),
    contenu JSONB NOT NULL,
    date_consultation DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des résultats d'examens
CREATE TABLE examens_resultats (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id INTEGER REFERENCES medecins(id),
    type_examen VARCHAR(100) NOT NULL,
    date_examen DATE NOT NULL,
    resultats JSONB NOT NULL,
    fichier_url TEXT,
    statut VARCHAR(20) DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rdv_confirme', 'rdv_rappel', 'resultat_examen', 'message')),
    titre VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'audit
CREATE TABLE logs_audit (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX idx_medecins_specialite ON medecins(specialite);
CREATE INDEX idx_medecins_nom ON medecins(nom);
CREATE INDEX idx_patients_nom ON patients(nom);
CREATE INDEX idx_patients_nss ON patients(nss);
CREATE INDEX idx_rendez_vous_date ON rendez_vous(date_heure);
CREATE INDEX idx_rendez_vous_medecin ON rendez_vous(medecin_id);
CREATE INDEX idx_rendez_vous_patient ON rendez_vous(patient_id);
CREATE INDEX idx_rendez_vous_statut ON rendez_vous(statut);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_lu ON notifications(lu);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medecins_updated_at BEFORE UPDATE ON medecins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rendez_vous_updated_at BEFORE UPDATE ON rendez_vous FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue pour les statistiques
CREATE OR REPLACE VIEW stats_quotidiennes AS
SELECT 
    DATE(date_heure) as jour,
    COUNT(*) as total_rdv,
    SUM(CASE WHEN statut = 'confirme' THEN 1 ELSE 0 END) as rdv_confirmes,
    SUM(CASE WHEN statut = 'en_attente' THEN 1 ELSE 0 END) as rdv_attente,
    SUM(CASE WHEN statut = 'termine' THEN 1 ELSE 0 END) as rdv_termines
FROM rendez_vous
GROUP BY DATE(date_heure)
ORDER BY jour DESC;

-- Fonction pour logger les actions
CREATE OR REPLACE FUNCTION log_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO logs_audit(user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        COALESCE(current_setting('app.current_user_id', true)::INTEGER, 1),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers d'audit
CREATE TRIGGER audit_patients AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION log_action();
CREATE TRIGGER audit_rendez_vous AFTER INSERT OR UPDATE OR DELETE ON rendez_vous FOR EACH ROW EXECUTE FUNCTION log_action();

-- Insertion des données de test
INSERT INTO users (email, password_hash, nom, prenom, role, telephone) VALUES
('admin@hopital.com', '$2a$10$rVvPqQ8Q8Q8Q8Q8Q8Q8Q8u', 'Admin', 'System', 'admin', '0612345678'),
('jean.dupont@hopital.com', '$2a$10$rVvPqQ8Q8Q8Q8Q8Q8Q8Q8u', 'DUPONT', 'Jean', 'medecin', '0612345678'),
('sophie.lebrun@hopital.com', '$2a$10$rVvPqQ8Q8Q8Q8Q8Q8Q8Q8u', 'LEBRUN', 'Sophie', 'medecin', '0623456789')
ON CONFLICT (email) DO NOTHING;

INSERT INTO medecins (user_id, nom, prenom, specialite, numero_ordre, telephone, email, disponibilite) VALUES
(2, 'DUPONT', 'Jean', 'Cardiologue', '01', '0612345678', 'jean.dupont@hopital.com', 'disponible'),
(3, 'LEBRUN', 'Sophie', 'Pediatre', '02', '0623456789', 'sophie.lebrun@hopital.com', 'disponible')
ON CONFLICT (numero_ordre) DO NOTHING;

INSERT INTO patients (nom, prenom, nss, date_naissance, telephone, email, groupe_sanguin) VALUES
('DUPONT', 'Marie', '123456789012345', '1985-03-15', '0612345678', 'marie@email.com', 'A+'),
('MARTIN', 'Jean', '234567890123456', '1990-07-22', '0623456789', 'jean@email.com', 'O+')
ON CONFLICT (nss) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données initialisée avec succès !';
END $$;

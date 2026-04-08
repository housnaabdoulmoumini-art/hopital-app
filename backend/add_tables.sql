-- =====================================================
-- AJOUT DE NOUVELLES TABLES
-- =====================================================

-- 1. Table des ordonnances
CREATE TABLE IF NOT EXISTS ordonnances (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medecin_id INTEGER REFERENCES medecins(id) ON DELETE CASCADE,
    date_ordonnance DATE DEFAULT CURRENT_DATE,
    diagnostic TEXT,
    recommandations TEXT,
    duree_validite INTEGER DEFAULT 30, -- en jours
    statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'expiree', 'annulee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.1 Lignes d'ordonnances (médicaments)
CREATE TABLE IF NOT EXISTS ordonnance_lignes (
    id SERIAL PRIMARY KEY,
    ordonnance_id INTEGER REFERENCES ordonnances(id) ON DELETE CASCADE,
    medicament VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    duree VARCHAR(100),
    posologie TEXT,
    quantite INTEGER DEFAULT 1,
    instructions TEXT
);

-- 2. Table des factures
CREATE TABLE IF NOT EXISTS factures (
    id SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    date_emission DATE DEFAULT CURRENT_DATE,
    date_echeance DATE NOT NULL,
    montant_ht DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) DEFAULT 0,
    montant_ttc DECIMAL(10,2) NOT NULL,
    statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'payee', 'annulee', 'impayee')),
    mode_paiement VARCHAR(50),
    date_paiement DATE,
    reference_paiement VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.1 Lignes de facture
CREATE TABLE IF NOT EXISTS facture_lignes (
    id SERIAL PRIMARY KEY,
    facture_id INTEGER REFERENCES factures(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantite INTEGER DEFAULT 1,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    montant DECIMAL(10,2) NOT NULL
);

-- 3. Table d'historique des consultations (déjà existante mais enrichie)
-- On ajoute des colonnes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter colonnes manquantes à dossiers_medicaux
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dossiers_medicaux' AND column_name = 'traitement') THEN
        ALTER TABLE dossiers_medicaux ADD COLUMN traitement TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dossiers_medicaux' AND column_name = 'prochain_rdv') THEN
        ALTER TABLE dossiers_medicaux ADD COLUMN prochain_rdv DATE;
    END IF;
END $$;

-- 4. Table des hospitalisations
CREATE TABLE IF NOT EXISTS hospitalisations (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    medecin_responsable_id INTEGER REFERENCES medecins(id),
    date_admission TIMESTAMP NOT NULL,
    date_sortie TIMESTAMP,
    motif VARCHAR(255) NOT NULL,
    service VARCHAR(100),
    chambre VARCHAR(20),
    statut VARCHAR(20) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'annule')),
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vue pour les statistiques avancées
CREATE OR REPLACE VIEW stats_avancees AS
SELECT 
    DATE(r.date_heure) as jour,
    COUNT(DISTINCT r.id) as total_rdv,
    COUNT(DISTINCT p.id) as total_patients,
    SUM(CASE WHEN r.statut = 'confirme' THEN 1 ELSE 0 END) as rdv_confirmes,
    SUM(CASE WHEN r.statut = 'termine' THEN 1 ELSE 0 END) as rdv_termines,
    COUNT(DISTINCT f.id) as total_factures,
    COALESCE(SUM(f.montant_ttc), 0) as chiffre_affaires
FROM rendez_vous r
LEFT JOIN patients p ON r.patient_id = p.id
LEFT JOIN factures f ON f.patient_id = p.id AND DATE(f.date_emission) = DATE(r.date_heure)
GROUP BY DATE(r.date_heure)
ORDER BY jour DESC;

-- 6. Vue des ordonnances actives
CREATE OR REPLACE VIEW ordonnances_actives AS
SELECT 
    o.id,
    o.date_ordonnance,
    p.nom as patient_nom,
    p.prenom as patient_prenom,
    m.nom as medecin_nom,
    m.prenom as medecin_prenom,
    o.diagnostic,
    o.duree_validite,
    CASE 
        WHEN o.date_ordonnance + (o.duree_validite || ' days')::INTERVAL > CURRENT_DATE 
        THEN 'active'
        ELSE 'expiree'
    END as statut
FROM ordonnances o
JOIN patients p ON o.patient_id = p.id
JOIN medecins m ON o.medecin_id = m.id
WHERE o.statut = 'active';

-- 7. Fonction pour générer le numéro de facture
CREATE OR REPLACE FUNCTION generer_numero_facture()
RETURNS TRIGGER AS $$
DECLARE
    annee TEXT;
    mois TEXT;
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    mois := TO_CHAR(CURRENT_DATE, 'MM');
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_facture, '-', 3) AS INTEGER)), 0) + 1 INTO compteur
    FROM factures
    WHERE numero_facture LIKE 'FAC-' || annee || '-' || mois || '-%';
    
    NEW.numero_facture := 'FAC-' || annee || '-' || mois || '-' || LPAD(compteur::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de facture
DROP TRIGGER IF EXISTS trigger_generer_numero_facture ON factures;
CREATE TRIGGER trigger_generer_numero_facture
    BEFORE INSERT ON factures
    FOR EACH ROW
    WHEN (NEW.numero_facture IS NULL)
    EXECUTE FUNCTION generer_numero_facture();

-- Index pour les nouvelles tables
CREATE INDEX IF NOT EXISTS idx_ordonnances_patient ON ordonnances(patient_id);
CREATE INDEX IF NOT EXISTS idx_ordonnances_medecin ON ordonnances(medecin_id);
CREATE INDEX IF NOT EXISTS idx_ordonnances_date ON ordonnances(date_ordonnance);
CREATE INDEX IF NOT EXISTS idx_factures_patient ON factures(patient_id);
CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero_facture);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date_emission);
CREATE INDEX IF NOT EXISTS idx_hospitalisations_patient ON hospitalisations(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospitalisations_dates ON hospitalisations(date_admission);

-- Triggers pour updated_at sur les nouvelles tables
CREATE TRIGGER update_ordonnances_updated_at 
    BEFORE UPDATE ON ordonnances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factures_updated_at 
    BEFORE UPDATE ON factures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitalisations_updated_at 
    BEFORE UPDATE ON hospitalisations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertion de données de test
INSERT INTO ordonnances (patient_id, medecin_id, diagnostic, recommandations) VALUES
(1, 1, 'Hypertension artérielle', 'Réduire le sel, activité physique régulière'),
(2, 2, 'Grippe saisonnière', 'Repos, hydratation, surveillance température');

INSERT INTO ordonnance_lignes (ordonnance_id, medicament, dosage, posologie, quantite) VALUES
(1, 'Lisinopril', '10mg', '1 comprimé par jour', 30),
(1, 'Amlodipine', '5mg', '1 comprimé par jour', 30),
(2, 'Paracétamol', '500mg', '1 comprimé toutes les 6h si douleur', 12);

INSERT INTO factures (patient_id, date_echeance, montant_ht, montant_ttc, statut) VALUES
(1, CURRENT_DATE + INTERVAL '30 days', 50.00, 60.00, 'en_attente'),
(2, CURRENT_DATE + INTERVAL '15 days', 25.00, 30.00, 'payee');

INSERT INTO facture_lignes (facture_id, description, quantite, prix_unitaire, montant) VALUES
(1, 'Consultation cardiologue', 1, 50.00, 50.00),
(2, 'Consultation pédiatre', 1, 25.00, 25.00);

INSERT INTO hospitalisations (patient_id, medecin_responsable_id, date_admission, motif, service, statut) VALUES
(1, 1, CURRENT_TIMESTAMP, 'Examen cardiologique approfondi', 'Cardiologie', 'en_cours');

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Nouvelles tables ajoutées avec succès !';
    RAISE NOTICE '   - ordonnances et ordonnance_lignes';
    RAISE NOTICE '   - factures et facture_lignes';
    RAISE NOTICE '   - hospitalisations';
    RAISE NOTICE '   - vues : stats_avancees, ordonnances_actives';
END $$;

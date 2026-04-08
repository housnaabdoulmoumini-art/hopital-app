const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const result = await pool.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }
        
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        
        try {
            await pool.query('SET app.current_user_id = $1', [decoded.id]);
        } catch (err) {
            // Ignorer l'erreur
        }
        
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Accès refusé. Rôle insuffisant.' });
        }
        
        next();
    };
};

module.exports = { authenticateToken, authorize };

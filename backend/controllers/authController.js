const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }
        
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const isValid = await User.verifyPassword(user, password);
        if (!isValid) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        const { password_hash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
};

const register = async (req, res) => {
    try {
        const { email, password, nom, prenom, role, telephone } = req.body;
        
        if (!email || !password || !nom || !prenom) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        
        const user = await User.create({ email, password, nom, prenom, role: role || 'patient', telephone });
        res.status(201).json({ message: 'Compte créé avec succès', user });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { login, register, getProfile };

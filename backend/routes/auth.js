const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// A real application would compare against hashed passwords in the SQL Database.
// For the sake of this setup, we have a hardcoded secure admin user.
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin') { // Use strong password in production
        const token = jwt.sign(
            { username, role: 'admin' }, 
            process.env.JWT_SECRET || 'fallback_secret_key_change_me',
            { expiresIn: '8h' }
        );
        res.json({ token, user: { username, role: 'admin' } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT Id, Username, PasswordHash, Role FROM Users WHERE Username = @Username');
            
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.recordset[0];
        const match = await bcrypt.compare(password, user.PasswordHash);
        
        if (match) {
            const token = jwt.sign(
                { id: user.Id, username: user.Username, role: user.Role }, 
                process.env.JWT_SECRET || 'fallback_secret_key_change_me',
                { expiresIn: '8h' }
            );
            res.json({ token, user: { id: user.Id, username: user.Username, role: user.Role } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

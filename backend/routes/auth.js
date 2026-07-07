const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../db');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per `window` (here, per 15 minutes)
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

router.post('/login', loginLimiter, async (req, res) => {
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
                process.env.JWT_SECRET,
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

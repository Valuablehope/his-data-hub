const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../db');

// Middleware to protect routes and verify admin role
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_me', (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        if (user.role !== 'admin') return res.status(403).json({ error: 'Requires admin privileges' });
        req.user = user;
        next();
    });
};

// GET all users
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Id, Username, DisplayName, Role, IsActive, LastLogin, CreatedAt 
            FROM Users 
            ORDER BY CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create new user
router.post('/', authenticateAdmin, async (req, res) => {
    const { username, password, role, displayName } = req.body;
    
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    // Default displayName to username if not provided
    const finalDisplayName = displayName || username;

    try {
        const pool = await poolPromise;
        
        // Check if user already exists
        const checkResult = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT Id FROM Users WHERE Username = @Username');
            
        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Transaction to insert User and default Availability
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const insertUserResult = await transaction.request()
                .input('Username', sql.VarChar, username)
                .input('PasswordHash', sql.VarChar, passwordHash)
                .input('Role', sql.VarChar, role)
                .input('DisplayName', sql.VarChar, finalDisplayName)
                .query(`
                    INSERT INTO Users (Username, PasswordHash, Role, DisplayName) 
                    OUTPUT INSERTED.Id 
                    VALUES (@Username, @PasswordHash, @Role, @DisplayName)
                `);
            
            const userId = insertUserResult.recordset[0].Id;

            await transaction.request()
                .input('UserId', sql.Int, userId)
                .query(`
                    INSERT INTO Availabilities (UserId, Status, Notes) 
                    VALUES (@UserId, 'Online', '')
                `);

            await transaction.commit();
            
            res.status(201).json({ 
                message: 'User created successfully', 
                user: { Id: userId, Username: username, DisplayName: finalDisplayName, Role: role } 
            });
        } catch (txnErr) {
            await transaction.rollback();
            throw txnErr;
        }

    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update user (role, username, isActive)
router.put('/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, role, isActive, displayName } = req.body;

    if (!username || !role) {
        return res.status(400).json({ error: 'Username and role are required' });
    }

    const finalDisplayName = displayName || username;

    try {
        const pool = await poolPromise;

        // Check if new username is taken by someone else
        const checkResult = await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Id', sql.Int, id)
            .query('SELECT Id FROM Users WHERE Username = @Username AND Id != @Id');
            
        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        await pool.request()
            .input('Id', sql.Int, id)
            .input('Username', sql.VarChar, username)
            .input('Role', sql.VarChar, role)
            .input('IsActive', sql.Bit, isActive)
            .input('DisplayName', sql.VarChar, finalDisplayName)
            .query(`
                UPDATE Users 
                SET Username = @Username, Role = @Role, IsActive = @IsActive, DisplayName = @DisplayName
                WHERE Id = @Id
            `);
            
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT reset user password
router.put('/:id/password', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const pool = await poolPromise;
        const passwordHash = await bcrypt.hash(password, 10);

        await pool.request()
            .input('Id', sql.Int, id)
            .input('PasswordHash', sql.VarChar, passwordHash)
            .query(`
                UPDATE Users 
                SET PasswordHash = @PasswordHash 
                WHERE Id = @Id
            `);
            
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a user
router.delete('/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Delete from Availabilities first (foreign key dependency logically)
            await transaction.request()
                .input('Id', sql.Int, id)
                .query('DELETE FROM Availabilities WHERE UserId = @Id');

            // Then delete user
            await transaction.request()
                .input('Id', sql.Int, id)
                .query('DELETE FROM Users WHERE Id = @Id');

            await transaction.commit();
            res.json({ message: 'User deleted successfully' });
        } catch (txnErr) {
            await transaction.rollback();
            throw txnErr;
        }

    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

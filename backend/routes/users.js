const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET all users
router.get('/', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 500 Id, Username, DisplayName, Role, IsActive, ShowOnDashboard, LastLogin, CreatedAt 
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
router.post('/', requireAdmin, async (req, res) => {
    const { username, password, role, displayName, showOnDashboard } = req.body;
    
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
                .input('ShowOnDashboard', sql.Bit, showOnDashboard !== false) // default to true
                .query(`
                    INSERT INTO Users (Username, PasswordHash, Role, DisplayName, ShowOnDashboard) 
                    OUTPUT INSERTED.Id 
                    VALUES (@Username, @PasswordHash, @Role, @DisplayName, @ShowOnDashboard)
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
router.put('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, role, isActive, displayName, showOnDashboard } = req.body;

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
            .input('ShowOnDashboard', sql.Bit, showOnDashboard !== false)
            .query(`
                UPDATE Users 
                SET Username = @Username, Role = @Role, IsActive = @IsActive, DisplayName = @DisplayName, ShowOnDashboard = @ShowOnDashboard
                WHERE Id = @Id
            `);
            
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT reset user password
router.put('/:id/password', requireAdmin, async (req, res) => {
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
router.delete('/:id', requireAdmin, async (req, res) => {
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

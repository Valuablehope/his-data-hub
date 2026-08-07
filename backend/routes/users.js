const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { poolPromise, sql } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const photosDir = path.join(__dirname, '..', 'uploads', 'team-photos');
if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
}

const photoUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, photosDir),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    }),
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            return cb(new Error('Only JPG, PNG, and WebP images are allowed'));
        }
        cb(null, true);
    },
});

// GET all users
router.get('/', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 500 Id, Username, DisplayName, Role, IsActive, ShowOnDashboard,
                   PhotoFileName, PublicTitle, ShowOnPublicTeam, LastLogin, CreatedAt
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
    const { username, password, role, displayName, showOnDashboard, publicTitle, showOnPublicTeam } = req.body;

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
                .input('PublicTitle', sql.NVarChar, publicTitle || null)
                .input('ShowOnPublicTeam', sql.Bit, !!showOnPublicTeam) // default to false
                .query(`
                    INSERT INTO Users (Username, PasswordHash, Role, DisplayName, ShowOnDashboard, PublicTitle, ShowOnPublicTeam)
                    OUTPUT INSERTED.Id
                    VALUES (@Username, @PasswordHash, @Role, @DisplayName, @ShowOnDashboard, @PublicTitle, @ShowOnPublicTeam)
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
    const { username, role, isActive, displayName, showOnDashboard, publicTitle, showOnPublicTeam } = req.body;

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
            .input('PublicTitle', sql.NVarChar, publicTitle || null)
            .input('ShowOnPublicTeam', sql.Bit, !!showOnPublicTeam)
            .query(`
                UPDATE Users
                SET Username = @Username, Role = @Role, IsActive = @IsActive, DisplayName = @DisplayName,
                    ShowOnDashboard = @ShowOnDashboard, PublicTitle = @PublicTitle, ShowOnPublicTeam = @ShowOnPublicTeam
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

// POST upload/replace a user's public-facing photo
router.post('/:id/photo', requireAdmin, photoUpload.single('photo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No photo uploaded or invalid file type' });
    }

    try {
        const pool = await poolPromise;
        const existing = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT PhotoFileName FROM Users WHERE Id = @Id');

        if (existing.recordset.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'User not found' });
        }

        await pool.request()
            .input('Id', sql.Int, id)
            .input('PhotoFileName', sql.NVarChar, req.file.filename)
            .query('UPDATE Users SET PhotoFileName = @PhotoFileName WHERE Id = @Id');

        const oldFileName = existing.recordset[0].PhotoFileName;
        if (oldFileName) {
            const oldPath = path.join(photosDir, oldFileName);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        res.json({ message: 'Photo updated successfully', fileName: req.file.filename });
    } catch (err) {
        console.error('Error uploading user photo:', err);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a user's photo — unauthenticated, mirrors the existing files.js download-by-id
// pattern (fetchable by direct ID like any other uploaded asset in this app).
router.get('/:id/photo', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT PhotoFileName FROM Users WHERE Id = @Id');

        const fileName = result.recordset[0]?.PhotoFileName;
        if (!fileName) return res.status(404).json({ error: 'No photo set' });

        const filePath = path.join(photosDir, fileName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Photo file missing on server' });

        res.sendFile(filePath);
    } catch (err) {
        console.error('Error fetching user photo:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a user
router.delete('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;

        const existing = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT PhotoFileName FROM Users WHERE Id = @Id');
        const photoFileName = existing.recordset[0]?.PhotoFileName;

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

            if (photoFileName) {
                const photoPath = path.join(photosDir, photoFileName);
                if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
            }

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

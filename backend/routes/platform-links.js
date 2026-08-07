const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { poolPromise, sql } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const logosDir = path.join(__dirname, '..', 'uploads', 'platform-logos');
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

const logoUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, logosDir),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
    }),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB — these are small logo icons
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
            return cb(new Error('Only JPG, PNG, WebP, and SVG images are allowed'));
        }
        cb(null, true);
    },
});

// GET all platform links (admin management view — includes inactive)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Id, Name, Url, LogoFileName, SortOrder, IsActive, CreatedAt, UpdatedAt
            FROM PlatformLinks
            ORDER BY SortOrder, Name
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching platform links:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create a new platform link
router.post('/', requireAdmin, async (req, res) => {
    const { name, url, sortOrder } = req.body;
    if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Url', sql.NVarChar, url)
            .input('SortOrder', sql.Int, sortOrder || 0)
            .query(`
                INSERT INTO PlatformLinks (Name, Url, SortOrder)
                OUTPUT INSERTED.Id
                VALUES (@Name, @Url, @SortOrder)
            `);
        res.status(201).json({ message: 'Platform link created', id: result.recordset[0].Id });
    } catch (err) {
        console.error('Error creating platform link:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update a platform link
router.put('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, url, sortOrder, isActive } = req.body;
    if (!name || !url) {
        return res.status(400).json({ error: 'Name and URL are required' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Name', sql.NVarChar, name)
            .input('Url', sql.NVarChar, url)
            .input('SortOrder', sql.Int, sortOrder || 0)
            .input('IsActive', sql.Bit, isActive !== false)
            .query(`
                UPDATE PlatformLinks
                SET Name = @Name, Url = @Url, SortOrder = @SortOrder, IsActive = @IsActive, UpdatedAt = GETDATE()
                WHERE Id = @Id
            `);
        res.json({ message: 'Platform link updated' });
    } catch (err) {
        console.error('Error updating platform link:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST upload/replace a platform link's logo
router.post('/:id/logo', requireAdmin, logoUpload.single('logo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No logo uploaded or invalid file type' });
    }

    try {
        const pool = await poolPromise;
        const existing = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT LogoFileName FROM PlatformLinks WHERE Id = @Id');

        if (existing.recordset.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Platform link not found' });
        }

        await pool.request()
            .input('Id', sql.Int, id)
            .input('LogoFileName', sql.NVarChar, req.file.filename)
            .query('UPDATE PlatformLinks SET LogoFileName = @LogoFileName, UpdatedAt = GETDATE() WHERE Id = @Id');

        const oldFileName = existing.recordset[0].LogoFileName;
        if (oldFileName) {
            const oldPath = path.join(logosDir, oldFileName);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        res.json({ message: 'Logo updated successfully', fileName: req.file.filename });
    } catch (err) {
        console.error('Error uploading platform logo:', err);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a platform link's logo — unauthenticated, shown publicly in the footer.
router.get('/:id/logo', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT LogoFileName FROM PlatformLinks WHERE Id = @Id');

        const fileName = result.recordset[0]?.LogoFileName;
        if (!fileName) return res.status(404).json({ error: 'No logo set' });

        const filePath = path.join(logosDir, fileName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Logo file missing on server' });

        res.sendFile(filePath);
    } catch (err) {
        console.error('Error fetching platform logo:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a platform link
router.delete('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        const existing = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT LogoFileName FROM PlatformLinks WHERE Id = @Id');
        const logoFileName = existing.recordset[0]?.LogoFileName;

        await pool.request()
            .input('Id', sql.Int, id)
            .query('DELETE FROM PlatformLinks WHERE Id = @Id');

        if (logoFileName) {
            const logoPath = path.join(logosDir, logoFileName);
            if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        }

        res.json({ message: 'Platform link deleted' });
    } catch (err) {
        console.error('Error deleting platform link:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

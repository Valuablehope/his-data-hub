const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { poolPromise } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Set up Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
            return cb(new Error('Only PDF and Word documents are allowed'));
        }
        cb(null, true);
    }
});

// GET /api/files - Get all uploaded files
router.get('/', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM UploadedFiles ORDER BY CreatedAt DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error("DB Error fetching files:", err);
        res.status(500).json({ error: "Failed to fetch files" });
    }
});

// POST /api/files/upload - Upload a new file
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('FileName', req.file.filename)
            .input('OriginalName', req.file.originalname)
            .input('MimeType', req.file.mimetype)
            .input('Size', req.file.size)
            .query(`
                INSERT INTO UploadedFiles (FileName, OriginalName, MimeType, Size)
                OUTPUT INSERTED.*
                VALUES (@FileName, @OriginalName, @MimeType, @Size)
            `);
        
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("DB Error uploading file:", err);
        // Clean up file if db insert fails
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Failed to save file metadata" });
    }
});

// GET /api/files/download/:id - Download a file
router.get('/download/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT * FROM UploadedFiles WHERE Id = @Id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }

        const fileRecord = result.recordset[0];
        const filePath = path.join(uploadDir, fileRecord.FileName);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.OriginalName}"`);
            res.setHeader('Content-Type', fileRecord.MimeType || 'application/octet-stream');
            res.setHeader('Content-Length', fileRecord.Size);
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ error: "Physical file missing on server" });
        }
    } catch (err) {
        console.error("DB Error downloading file:", err);
        res.status(500).json({ error: "Failed to download file" });
    }
});

// DELETE /api/files/:id - Delete a file
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', req.params.id)
            .query('SELECT * FROM UploadedFiles WHERE Id = @Id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "File not found" });
        }

        const fileRecord = result.recordset[0];
        const filePath = path.join(uploadDir, fileRecord.FileName);

        // Delete from database
        await pool.request()
            .input('Id', req.params.id)
            .query('DELETE FROM UploadedFiles WHERE Id = @Id');

        // Delete physical file if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: "File deleted successfully" });
    } catch (err) {
        console.error("DB Error deleting file:", err);
        res.status(500).json({ error: "Failed to delete file" });
    }
});

module.exports = router;

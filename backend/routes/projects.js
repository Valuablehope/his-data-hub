const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { poolPromise, sql } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Admin-managed showcase of projects/contributions to the national health
// system, shown on the public landing page. Distinct from the unrelated
// ProjectLinks feature (per-project tool URLs, no logo) — do not confuse.

const logosDir = path.join(__dirname, '..', 'uploads', 'project-logos');
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

// GET all projects (admin management view — includes inactive)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT Id, Name, Description, Content, Partner, Url, LogoFileName, SortOrder, IsActive, CreatedAt, UpdatedAt
            FROM Projects
            ORDER BY SortOrder, Name
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a single project's full detail + its milestones — public, this is
// what the landing page's project cards link to.
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const projectRes = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                SELECT Id, Name, Description, Content, Partner, Url,
                       CASE WHEN LogoFileName IS NOT NULL THEN 1 ELSE 0 END AS HasLogo
                FROM Projects
                WHERE Id = @Id AND IsActive = 1
            `);
        const project = projectRes.recordset[0];
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const milestonesRes = await pool.request()
            .input('ProjectId', sql.Int, id)
            .query(`
                SELECT Id, Title, Description, DateLabel, SortOrder
                FROM ProjectMilestones
                WHERE ProjectId = @ProjectId
                ORDER BY SortOrder, Id
            `);

        res.json({
            id: project.Id,
            name: project.Name,
            description: project.Description,
            content: project.Content,
            partner: project.Partner,
            url: project.Url,
            hasLogo: !!project.HasLogo,
            milestones: milestonesRes.recordset.map(m => ({
                id: m.Id, title: m.Title, description: m.Description, dateLabel: m.DateLabel,
            })),
        });
    } catch (err) {
        console.error('Error fetching project detail:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create a new project
router.post('/', requireAdmin, async (req, res) => {
    const { name, description, content, partner, url, sortOrder } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Description', sql.NVarChar, description || null)
            .input('Content', sql.NVarChar(sql.MAX), content || null)
            .input('Partner', sql.NVarChar, partner || null)
            .input('Url', sql.NVarChar, url || null)
            .input('SortOrder', sql.Int, sortOrder || 0)
            .query(`
                INSERT INTO Projects (Name, Description, Content, Partner, Url, SortOrder)
                OUTPUT INSERTED.Id
                VALUES (@Name, @Description, @Content, @Partner, @Url, @SortOrder)
            `);
        res.status(201).json({ message: 'Project created', id: result.recordset[0].Id });
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update a project
router.put('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, content, partner, url, sortOrder, isActive } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Name', sql.NVarChar, name)
            .input('Description', sql.NVarChar, description || null)
            .input('Content', sql.NVarChar(sql.MAX), content || null)
            .input('Partner', sql.NVarChar, partner || null)
            .input('Url', sql.NVarChar, url || null)
            .input('SortOrder', sql.Int, sortOrder || 0)
            .input('IsActive', sql.Bit, isActive !== false)
            .query(`
                UPDATE Projects
                SET Name = @Name, Description = @Description, Content = @Content, Partner = @Partner, Url = @Url,
                    SortOrder = @SortOrder, IsActive = @IsActive, UpdatedAt = GETDATE()
                WHERE Id = @Id
            `);
        res.json({ message: 'Project updated' });
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ─── Milestones (admin-managed, ordered timeline entries per project) ─────

// GET a project's milestones — admin view (unlike the public /:id detail
// route, this isn't gated on the project being IsActive, so hidden/draft
// projects can still be edited).
router.get('/:id/milestones', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProjectId', sql.Int, id)
            .query(`
                SELECT Id, Title, Description, DateLabel, SortOrder
                FROM ProjectMilestones
                WHERE ProjectId = @ProjectId
                ORDER BY SortOrder, Id
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching milestones:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create a milestone
router.post('/:id/milestones', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, dateLabel, sortOrder } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ProjectId', sql.Int, id)
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description || null)
            .input('DateLabel', sql.NVarChar, dateLabel || null)
            .input('SortOrder', sql.Int, sortOrder || 0)
            .query(`
                INSERT INTO ProjectMilestones (ProjectId, Title, Description, DateLabel, SortOrder)
                OUTPUT INSERTED.Id
                VALUES (@ProjectId, @Title, @Description, @DateLabel, @SortOrder)
            `);
        res.status(201).json({ message: 'Milestone created', id: result.recordset[0].Id });
    } catch (err) {
        console.error('Error creating milestone:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update a milestone
router.put('/:id/milestones/:milestoneId', requireAdmin, async (req, res) => {
    const { milestoneId } = req.params;
    const { title, description, dateLabel, sortOrder } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, milestoneId)
            .input('Title', sql.NVarChar, title)
            .input('Description', sql.NVarChar, description || null)
            .input('DateLabel', sql.NVarChar, dateLabel || null)
            .input('SortOrder', sql.Int, sortOrder || 0)
            .query(`
                UPDATE ProjectMilestones
                SET Title = @Title, Description = @Description, DateLabel = @DateLabel, SortOrder = @SortOrder
                WHERE Id = @Id
            `);
        res.json({ message: 'Milestone updated' });
    } catch (err) {
        console.error('Error updating milestone:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a milestone
router.delete('/:id/milestones/:milestoneId', requireAdmin, async (req, res) => {
    const { milestoneId } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.Int, milestoneId)
            .query('DELETE FROM ProjectMilestones WHERE Id = @Id');
        res.json({ message: 'Milestone deleted' });
    } catch (err) {
        console.error('Error deleting milestone:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST upload/replace a project's logo
router.post('/:id/logo', requireAdmin, logoUpload.single('logo'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No logo uploaded or invalid file type' });
    }

    try {
        const pool = await poolPromise;
        const existing = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT LogoFileName FROM Projects WHERE Id = @Id');

        if (existing.recordset.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Project not found' });
        }

        await pool.request()
            .input('Id', sql.Int, id)
            .input('LogoFileName', sql.NVarChar, req.file.filename)
            .query('UPDATE Projects SET LogoFileName = @LogoFileName, UpdatedAt = GETDATE() WHERE Id = @Id');

        const oldFileName = existing.recordset[0].LogoFileName;
        if (oldFileName) {
            const oldPath = path.join(logosDir, oldFileName);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        res.json({ message: 'Logo updated successfully', fileName: req.file.filename });
    } catch (err) {
        console.error('Error uploading project logo:', err);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET a project's logo — unauthenticated, shown publicly on the landing page.
router.get('/:id/logo', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT LogoFileName FROM Projects WHERE Id = @Id');

        const fileName = result.recordset[0]?.LogoFileName;
        if (!fileName) return res.status(404).json({ error: 'No logo set' });

        const filePath = path.join(logosDir, fileName);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Logo file missing on server' });

        res.sendFile(filePath);
    } catch (err) {
        console.error('Error fetching project logo:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE a project
router.delete('/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;

        const existing = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT LogoFileName FROM Projects WHERE Id = @Id');
        const logoFileName = existing.recordset[0]?.LogoFileName;

        await pool.request()
            .input('Id', sql.Int, id)
            .query('DELETE FROM Projects WHERE Id = @Id');

        if (logoFileName) {
            const logoPath = path.join(logosDir, logoFileName);
            if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        }

        res.json({ message: 'Project deleted' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

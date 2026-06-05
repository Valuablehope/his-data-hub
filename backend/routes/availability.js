const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../db');

// Public route to get all HIS team member availabilities (incorporating weekly schedule overrides)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                u.Id, 
                u.Username, 
                CASE 
                    WHEN w.Id IS NULL THEN a.Status -- No schedule defined yet
                    WHEN w.IsAvailable = 1 AND CAST(GETDATE() AS TIME) BETWEEN w.StartTime AND w.EndTime THEN a.Status
                    ELSE 'Offline'
                END AS Status,
                a.Notes,
                a.UpdatedAt
            FROM Users u
            JOIN Availabilities a ON u.Id = a.UserId
            LEFT JOIN WeeklySchedules w 
                ON w.UserId = u.Id AND w.DayOfWeek = (DATEDIFF(day, '18991231', GETDATE()) % 7)
            WHERE u.Role = 'HIS_TEAM'
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching availabilities:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_change_me', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Protected route to update logged-in user's availability status manually
router.put('/', authenticateToken, async (req, res) => {
    const { status, notes } = req.body;
    const userId = req.user.id;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('UserId', sql.Int, userId)
            .input('Status', sql.VarChar, status)
            .input('Notes', sql.NVarChar, notes || '')
            .query(`
                UPDATE Availabilities
                SET Status = @Status, Notes = @Notes, UpdatedAt = GETDATE()
                WHERE UserId = @UserId
            `);
        
        res.json({ message: 'Availability updated successfully' });
    } catch (err) {
        console.error('Error updating availability:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET user's weekly schedule
router.get('/schedule', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .query(`
                SELECT DayOfWeek, IsAvailable, StartTime, EndTime
                FROM WeeklySchedules
                WHERE UserId = @UserId
                ORDER BY DayOfWeek ASC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching weekly schedule:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to create a valid Date object for sql.Time from HH:mm string
const createTimeDate = (timeStr) => {
    // timeStr is usually "HH:mm" from input type="time"
    if (!timeStr || timeStr.trim() === '') return new Date('1970-01-01T09:00:00Z');
    
    // Ensure we have seconds
    const withSeconds = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    return new Date(`1970-01-01T${withSeconds}Z`);
};

// PUT to update user's weekly schedule (overwrites existing)
router.put('/schedule', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { schedule } = req.body; // Array of { dayOfWeek, isAvailable, startTime, endTime }

    if (!Array.isArray(schedule)) {
        return res.status(400).json({ error: 'Schedule array is required' });
    }

    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Delete existing
            await transaction.request()
                .input('UserId', sql.Int, userId)
                .query(`DELETE FROM WeeklySchedules WHERE UserId = @UserId`);

            // Insert new rows one by one
            for (const day of schedule) {
                // Parse time strings into Date objects required by mssql's sql.Time
                const sTimeDate = createTimeDate(day.startTime);
                const eTimeDate = createTimeDate(day.endTime);

                await transaction.request()
                    .input('UserId', sql.Int, userId)
                    .input('DayOfWeek', sql.Int, day.dayOfWeek)
                    .input('IsAvailable', sql.Bit, day.isAvailable ? 1 : 0)
                    .input('StartTime', sql.Time, sTimeDate)
                    .input('EndTime', sql.Time, eTimeDate)
                    .query(`
                        INSERT INTO WeeklySchedules (UserId, DayOfWeek, IsAvailable, StartTime, EndTime)
                        VALUES (@UserId, @DayOfWeek, @IsAvailable, @StartTime, @EndTime)
                    `);
            }

            await transaction.commit();
            res.json({ message: 'Weekly schedule updated' });
        } catch (err) {
            console.error('Transaction query failed:', err);
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error('Transaction rollback failed:', rollbackErr);
            }
            res.status(500).json({ error: 'Database update failed' });
        }
    } catch (err) {
        console.error('Error starting weekly schedule transaction:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

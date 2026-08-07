const jwt = require('jsonwebtoken');

// Verifies the JWT is present and valid. Attaches the decoded payload to req.user.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
        req.user = user;
        next();
    });
};

// Gates on role, case-insensitively (role casing is inconsistent in the DB: 'admin', 'HIS_TEAM', 'viewer').
// Must run after authenticateToken (or be composed via one of the arrays below).
const requireRole = (...roles) => {
    const normalized = roles.map(r => r.toLowerCase());
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Authentication required' });
        if (!normalized.includes(String(req.user.role).toLowerCase())) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Drop-in replacements for route arrays: router.get('/', requireAdmin, handler)
const requireAdmin = [authenticateToken, requireRole('admin')];
const requireContentManager = [authenticateToken, requireRole('admin', 'HIS_TEAM')];

module.exports = { authenticateToken, requireRole, requireAdmin, requireContentManager };

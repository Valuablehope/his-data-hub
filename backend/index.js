const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder', 'ngrok-skip-browser-warning'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly respond to all preflight requests
app.use(express.json());

const docsRouter = require('./routes/docs');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'HIS Data Hub API is running' });
});

const formsRouter      = require('./routes/forms');
const flowsRouter      = require('./routes/flows');
const filesRouter      = require('./routes/files');
const facilitiesRouter = require('./routes/facilities');
const availabilityRouter = require('./routes/availability');
const usersRouter         = require('./routes/users');
const projectLinksRouter  = require('./routes/project-links');

app.use('/api/dashboard',  dashboardRouter);
app.use('/api/docs',       docsRouter);
app.use('/api/auth',       authRouter);
app.use('/api/forms',      formsRouter);
app.use('/api/flows',      flowsRouter);
app.use('/api/files',      filesRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/users',         usersRouter);
app.use('/api/project-links', projectLinksRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

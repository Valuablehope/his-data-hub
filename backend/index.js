const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const docsRouter = require('./routes/docs');
const authRouter = require('./routes/auth');

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'HIS Data Hub API is running' });
});

const formsRouter = require('./routes/forms');
const flowsRouter = require('./routes/flows');

app.use('/api/docs', docsRouter);
app.use('/api/auth', authRouter);
app.use('/api/forms', formsRouter);
app.use('/api/flows', flowsRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

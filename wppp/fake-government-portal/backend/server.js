const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const applicationRoutes = require('./routes/applicationRoutes');
const statusRoutes = require('./routes/statusRoutes');
const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');
const vaultRoutes = require('./routes/vaultRoutes');

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true, simulated: true, service: 'fake-government-portal' });
});

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/vault', vaultRoutes);

const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(frontendDir, 'dashboard.html'));
});

app.get('/applications', (req, res) => {
  res.sendFile(path.join(frontendDir, 'applications.html'));
});

app.get('/application', (req, res) => {
  res.sendFile(path.join(frontendDir, 'application.html'));
});

app.get('/review', (req, res) => {
  res.sendFile(path.join(frontendDir, 'review.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    simulated: true,
    message: 'Unexpected simulated government portal error.'
  });
});

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch((error) => console.error('MongoDB connection failed:', error.message));
} else {
  console.log('MongoDB URI not provided. Using in-memory demo datastore.');
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Fake government portal running on http://localhost:${PORT}`);
  });
}

module.exports = { app, createApp: () => app };

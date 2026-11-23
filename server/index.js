const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'Feedback Management System',
    timestamp: new Date().toISOString()
  });
});

// Default route navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error: ' + err.message
  });
});

// Start Server after initializing database
async function startServer() {
  try {
    await db.initializeDb();
    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Feedback App server running on http://localhost:${PORT}`);
      console.log(`   - Landing & Summary: http://localhost:${PORT}/index.html`);
      console.log(`   - User Login:       http://localhost:${PORT}/login.html`);
      console.log(`   - Registration:     http://localhost:${PORT}/register.html`);
      console.log(`   - User Dashboard:   http://localhost:${PORT}/dashboard.html`);
      console.log(`   - Admin Dashboard:  http://localhost:${PORT}/admin.html`);
      console.log(`===============================================`);
    });
    return server;
  } catch (error) {
    console.error('Failed to initialize and start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

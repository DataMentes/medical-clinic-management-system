// app.js
const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patient', require('./routes/patient.routes'));
app.use('/api/doctor', require('./routes/doctor.routes'));
app.use('/api/reception', require('./routes/reception.routes'));
app.use('/api/admin', require('./routes/admin.routes'));



// Health check
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});
const path = require('path');

// Serve React build files
app.use(express.static(path.join(__dirname, '../dist')));

// Handle React routing for non-API routes

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});



// 404 handler - Must be after all routes
app.use(notFoundHandler);

// Global error handler - Must be last
app.use(errorHandler);

module.exports = app;

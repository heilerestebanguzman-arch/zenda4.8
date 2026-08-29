// src/app.js - VERSIÓN COMPLETA
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 8095;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas
app.use('/api/v1/payments', paymentRoutes);

// Health Check raíz
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'modulo_14_recaudo_masivo',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 M14 - Recaudo Masivo corriendo en puerto ${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`💳 Payments API: http://localhost:${PORT}/api/v1/payments`);
});

module.exports = app;

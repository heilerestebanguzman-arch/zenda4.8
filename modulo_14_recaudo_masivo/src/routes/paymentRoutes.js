const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const axios = require('axios');

const API_MOBILITY = process.env.API_MOBILITY || 'http://localhost:8103/api/v1/mobility';

router.post('/initiate', async (req, res) => {
  try {
    const { tripId, userId, amount, method } = req.body;

    if (!tripId || !userId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos: tripId, userId, amount son requeridos'
      });
    }

    const validMethods = ['qr', 'cash', 'card'];
    if (method && !validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Metodo invalido. Usar: ' + validMethods.join(', ')
      });
    }

    const existingCheck = await pool.query(
      'SELECT * FROM tenant_default.fare_payments WHERE trip_id = $1 AND status = $2 LIMIT 1',
      [tripId, 'pending']
    );

    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0];
      return res.status(200).json({
        success: true,
        message: 'Ya existe un pago pendiente para este viaje',
        data: {
          paymentId: existing.payment_id,
          status: existing.status,
          qrCode: existing.qr_code,
          amount: existing.amount,
          method: existing.method,
          createdAt: existing.created_at
        }
      });
    }

    const paymentId = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    let qrCode = method === 'qr' ? 'ZENDA-PAY-' + paymentId : null;

    const query = `
      INSERT INTO tenant_default.fare_payments 
      (payment_id, trip_id, user_id, amount, method, status, qr_code, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;

    const values = [paymentId, tripId, userId, amount, method || 'qr', 'pending', qrCode];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Pago iniciado correctamente',
      data: {
        paymentId: result.rows[0].payment_id,
        status: result.rows[0].status,
        qrCode: result.rows[0].qr_code,
        amount: result.rows[0].amount,
        method: result.rows[0].method,
        createdAt: result.rows[0].created_at
      }
    });

  } catch (error) {
    console.error('Error al iniciar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
});

router.post('/confirm', async (req, res) => {
  try {
    const { paymentId, status, cashAmount } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos: paymentId y status son requeridos'
      });
    }

    const validStatus = ['completed', 'failed', 'cancelled'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado invalido. Usar: ' + validStatus.join(', ')
      });
    }

    const currentPayment = await pool.query(
      'SELECT * FROM tenant_default.fare_payments WHERE payment_id = $1',
      [paymentId]
    );

    if (currentPayment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    const oldStatus = currentPayment.rows[0].status;

    // ✅ CONSULTA SIMPLIFICADA - SIN CASTING COMPLEJO
    let query = '';
    let values = [];

    if (status === 'completed') {
      query = `
        UPDATE tenant_default.fare_payments 
        SET 
          status = $1,
          completed_at = NOW(),
          updated_at = NOW()
        WHERE payment_id = $2
        RETURNING *
      `;
      values = [status, paymentId];
    } else {
      query = `
        UPDATE tenant_default.fare_payments 
        SET 
          status = $1,
          updated_at = NOW()
        WHERE payment_id = $2
        RETURNING *
      `;
      values = [status, paymentId];
    }

    // Si hay cashAmount, agregarlo a la consulta
    if (cashAmount !== undefined && cashAmount !== null) {
      query = query.replace('SET', 'SET cash_amount = $3, ');
      values.push(cashAmount);
    }

    const result = await pool.query(query, values);

    if (status === 'completed' && oldStatus !== 'completed') {
      const tripId = result.rows[0].trip_id;
      
      try {
        console.log('📡 Notificando a M20: viaje ' + tripId + ' completado');
        
        await axios.post(API_MOBILITY + '/trips/complete', {
          tripId: tripId,
          paymentId: paymentId,
          amount: result.rows[0].amount,
          status: 'paid'
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'X-Service': 'modulo_14_recaudo_masivo'
          }
        });

        console.log('✅ Viaje ' + tripId + ' finalizado correctamente en M20');

      } catch (webhookError) {
        console.error('❌ Error al notificar a M20:', webhookError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Pago actualizado correctamente',
      data: {
        paymentId: result.rows[0].payment_id,
        status: result.rows[0].status,
        amount: result.rows[0].amount,
        cashAmount: result.rows[0].cash_amount,
        completedAt: result.rows[0].completed_at,
        updatedAt: result.rows[0].updated_at,
        tripId: result.rows[0].trip_id
      }
    });

  } catch (error) {
    console.error('❌ Error al confirmar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar el pago',
      error: error.message
    });
  }
});

router.get('/trip/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;

    const query = 'SELECT * FROM tenant_default.fare_payments WHERE trip_id = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await pool.query(query, [tripId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontro pago para este viaje'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pago',
      error: error.message
    });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const query = 'SELECT * FROM tenant_default.fare_payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const result = await pool.query(query, [userId, parseInt(limit), parseInt(offset)]);

    const countQuery = 'SELECT COUNT(*) FROM tenant_default.fare_payments WHERE user_id = $1';
    const countResult = await pool.query(countQuery, [userId]);

    res.status(200).json({
      success: true,
      data: {
        payments: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial',
      error: error.message
    });
  }
});

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'modulo_14_recaudo_masivo',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8095;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// CONEXIÓN A BASE DE DATOS
// ============================================

// PostgreSQL
const pool = new Pool({
    user: 'zenda_admin',
    password: 'zenda_secure_pass_2026',
    host: 'localhost',
    port: 5432,
    database: 'zenda',
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL connected successfully (M14)');
});

// Redis
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully (M14)');
});

redisClient.connect();

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        service: 'modulo_14_recaudo_masivo',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINTS DE PAGOS
// ============================================

// POST /api/v1/payments/validate - Validar pago en bus
app.post('/api/v1/payments/validate', async (req, res) => {
    try {
        const { 
            userId, 
            amount, 
            routeId, 
            busId, 
            paymentMethod 
        } = req.body;

        if (!userId || !amount || !routeId) {
            return res.status(400).json({
                success: false,
                error: 'userId, amount y routeId son requeridos'
            });
        }

        // 1. Verificar ventana de transbordo (M14.1)
        const transferKey = `transfer:window:${userId}`;
        const transferData = await redisClient.get(transferKey);
        let finalAmount = amount;
        let discountApplied = false;
        let transferNumber = 0;

        if (transferData) {
            const windowData = JSON.parse(transferData);
            const elapsed = (Date.now() - windowData.timestamp) / 1000 / 60;
            
            if (elapsed <= 45) {
                transferNumber = windowData.transfer_number || 1;
                if (transferNumber === 2) {
                    finalAmount = amount * 0.5;
                    discountApplied = true;
                } else if (transferNumber >= 3) {
                    finalAmount = 0;
                    discountApplied = true;
                }
                
                windowData.transfer_number = transferNumber + 1;
                await redisClient.setEx(transferKey, 2700, JSON.stringify(windowData));
            }
        }

        // 2. Registrar pago en PostgreSQL
        const result = await pool.query(
            `INSERT INTO tenant_default.fare_payments 
             (user_id, amount, route_id, bus_id, method, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, created_at`,
            [userId, finalAmount, routeId, busId, paymentMethod || 'QR', 'completed']
        );

        res.json({
            success: true,
            data: {
                transaction_id: result.rows[0].id,
                user_id: userId,
                original_amount: amount,
                final_amount: finalAmount,
                discount_applied: discountApplied,
                discount_percentage: discountApplied ? (1 - finalAmount / amount) * 100 : 0,
                transfer_number: transferNumber,
                status: 'completed',
                timestamp: result.rows[0].created_at
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error validating payment:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// GET /api/v1/payments/balance/:userId - Consultar saldo
app.get('/api/v1/payments/balance/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const cacheKey = `balance:${userId}`;
        const cached = await redisClient.get(cacheKey);
        
        if (cached) {
            return res.json({
                success: true,
                data: JSON.parse(cached),
                source: 'cache'
            });
        }

        const balance = {
            user_id: userId,
            balance: 150.00,
            currency: 'USD',
            last_updated: new Date().toISOString()
        };

        await redisClient.setEx(cacheKey, 300, JSON.stringify(balance));

        res.json({
            success: true,
            data: balance,
            source: 'database'
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error getting balance:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// POST /api/v1/payments/top-up - Recargar saldo
app.post('/api/v1/payments/top-up', async (req, res) => {
    try {
        const { userId, amount, method } = req.body;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'userId y amount (mayor a 0) son requeridos'
            });
        }

        const result = await pool.query(
            `INSERT INTO tenant_default.fare_payments 
             (user_id, amount, method, status) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, created_at`,
            [userId, amount, method || 'CASH', 'completed']
        );

        await redisClient.del(`balance:${userId}`);

        res.json({
            success: true,
            data: {
                transaction_id: result.rows[0].id,
                user_id: userId,
                amount: amount,
                method: method || 'CASH',
                status: 'completed',
                timestamp: result.rows[0].created_at
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error topping up balance:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// GET /api/v1/payments/daily - Resumen diario de recaudo
app.get('/api/v1/payments/daily', async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_transactions,
                SUM(amount) as total_amount,
                COUNT(CASE WHEN discount_applied THEN 1 END) as discounted_transactions,
                SUM(CASE WHEN discount_applied THEN amount ELSE 0 END) as discounted_amount
             FROM tenant_default.fare_payments 
             WHERE DATE(created_at) = $1 AND status = 'completed'`,
            [date]
        );

        const totalTransactions = parseInt(result.rows[0].total_transactions) || 0;
        const totalAmount = parseFloat(result.rows[0].total_amount) || 0;

        res.json({
            success: true,
            data: {
                date: date,
                total_transactions: totalTransactions,
                total_amount: totalAmount,
                discounted_transactions: parseInt(result.rows[0].discounted_transactions) || 0,
                discounted_amount: parseFloat(result.rows[0].discounted_amount) || 0,
                average_ticket: totalTransactions > 0 ? totalAmount / totalTransactions : 0
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error getting daily summary:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// POST /api/v1/payments/offline/sync - Sincronizar pagos offline
app.post('/api/v1/payments/offline/sync', async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere un array de transacciones offline'
            });
        }

        let synced = 0;
        let failed = 0;

        for (const tx of transactions) {
            try {
                await pool.query(
                    `INSERT INTO tenant_default.fare_payments 
                     (user_id, amount, route_id, bus_id, method, status) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [tx.userId, tx.amount, tx.routeId, tx.busId, tx.method || 'OFFLINE', 'completed']
                );
                synced++;
            } catch (error) {
                failed++;
                console.error('❌ Error syncing transaction:', tx.id);
            }
        }

        res.json({
            success: true,
            data: {
                synced: synced,
                failed: failed,
                total: transactions.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error syncing offline payments:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`💰 M14 - Recaudo Masivo corriendo en http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/health`);
    console.log(`📝 Validate: http://localhost:${PORT}/api/v1/payments/validate`);
    console.log(`📝 Balance: http://localhost:${PORT}/api/v1/payments/balance/{userId}`);
    console.log(`📝 Top-up: http://localhost:${PORT}/api/v1/payments/top-up`);
    console.log(`📝 Daily: http://localhost:${PORT}/api/v1/payments/daily`);
});

export default app;
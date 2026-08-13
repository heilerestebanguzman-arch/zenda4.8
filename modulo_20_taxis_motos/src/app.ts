import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createClient } from 'redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8103;

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
    console.log('✅ PostgreSQL connected successfully (M20)');
});

// Redis
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully (M20)');
});

redisClient.connect();

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        service: 'modulo_20_taxis_motos',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINTS DE TAXIS Y MOTOS
// ============================================

// POST /api/v1/mobility/request - Solicitar taxi/moto
app.post('/api/v1/mobility/request', async (req, res) => {
    try {
        const { 
            userId, 
            lat, 
            lng, 
            vehicleType, 
            destinationLat, 
            destinationLng 
        } = req.body;

        if (!userId || !lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'userId, lat y lng son requeridos'
            });
        }

        const validTypes = ['TAXI', 'MOTO'];
        if (!validTypes.includes(vehicleType || 'TAXI')) {
            return res.status(400).json({
                success: false,
                error: 'Tipo inválido. Permitidos: TAXI, MOTO'
            });
        }

        // Buscar conductor más cercano (simulado)
        const nearbyDrivers = [
            { id: 'driver-1', name: 'Juan Pérez', lat: -17.7800, lng: -63.1800, rating: 4.8 },
            { id: 'driver-2', name: 'María Gómez', lat: -17.7850, lng: -63.1850, rating: 4.9 },
        ];

        // Calcular distancia (simulado)
        const assignedDriver = nearbyDrivers[0];

        // Crear viaje en PostgreSQL
        const result = await pool.query(
            `INSERT INTO tenant_default.mobility_trips 
             (user_id, driver_id, vehicle_type, start_location, status) 
             VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6) 
             RETURNING id, created_at`,
            [userId, assignedDriver.id, vehicleType || 'TAXI', lng, lat, 'requested']
        );

        // Guardar en Redis para tracking
        await redisClient.setEx(
            `trip:${result.rows[0].id}`,
            3600,
            JSON.stringify({
                tripId: result.rows[0].id,
                userId: userId,
                driverId: assignedDriver.id,
                status: 'requested',
                createdAt: result.rows[0].created_at
            })
        );

        res.json({
            success: true,
            data: {
                trip_id: result.rows[0].id,
                status: 'requested',
                driver: assignedDriver,
                vehicle_type: vehicleType || 'TAXI',
                estimated_wait: Math.floor(Math.random() * 5) + 3,
                created_at: result.rows[0].created_at
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error requesting trip:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// GET /api/v1/mobility/status/:tripId - Estado del viaje
app.get('/api/v1/mobility/status/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;

        const cached = await redisClient.get(`trip:${tripId}`);
        if (cached) {
            return res.json({
                success: true,
                data: JSON.parse(cached),
                source: 'cache'
            });
        }

        const result = await pool.query(
            `SELECT * FROM tenant_default.mobility_trips WHERE id = $1`,
            [tripId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Viaje no encontrado'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            source: 'database'
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error getting trip status:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// POST /api/v1/mobility/cancel - Cancelar viaje
app.post('/api/v1/mobility/cancel', async (req, res) => {
    try {
        const { tripId, userId } = req.body;

        if (!tripId || !userId) {
            return res.status(400).json({
                success: false,
                error: 'tripId y userId son requeridos'
            });
        }

        const result = await pool.query(
            `UPDATE tenant_default.mobility_trips 
             SET status = 'cancelled' 
             WHERE id = $1 AND user_id = $2 
             RETURNING id`,
            [tripId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Viaje no encontrado o no pertenece al usuario'
            });
        }

        await redisClient.del(`trip:${tripId}`);

        res.json({
            success: true,
            data: {
                trip_id: tripId,
                status: 'cancelled',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error cancelling trip:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// POST /api/v1/mobility/rate - Calificar conductor
app.post('/api/v1/mobility/rate', async (req, res) => {
    try {
        const { tripId, rating, comment } = req.body;

        if (!tripId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'tripId y rating (1-5) son requeridos'
            });
        }

        const result = await pool.query(
            `UPDATE tenant_default.mobility_trips 
             SET rating_driver = $1 
             WHERE id = $2 
             RETURNING id`,
            [rating, tripId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Viaje no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                trip_id: tripId,
                rating: rating,
                comment: comment || '',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error rating trip:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// GET /api/v1/mobility/driver/nearby - Conductores cercanos
app.get('/api/v1/mobility/driver/nearby', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'lat y lng son requeridos'
            });
        }

        // Simular conductores cercanos
        const drivers = [
            { id: 'driver-1', name: 'Juan Pérez', lat: -17.7800, lng: -63.1800, rating: 4.8, distance: 0.5 },
            { id: 'driver-2', name: 'María Gómez', lat: -17.7850, lng: -63.1850, rating: 4.9, distance: 0.8 },
            { id: 'driver-3', name: 'Carlos López', lat: -17.7750, lng: -63.1900, rating: 4.7, distance: 1.2 },
        ];

        res.json({
            success: true,
            data: drivers,
            count: drivers.length
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error getting nearby drivers:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// GET /api/v1/mobility/history/:userId - Historial de viajes
app.get('/api/v1/mobility/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await pool.query(
            `SELECT * FROM tenant_default.mobility_trips 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2`,
            [userId, limit]
        );

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error getting trip history:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// POST /api/v1/mobility/driver/availability - Alternar disponibilidad del conductor
app.post('/api/v1/mobility/driver/availability', async (req, res) => {
    try {
        const { driverId, available } = req.body;

        if (!driverId) {
            return res.status(400).json({
                success: false,
                error: 'driverId es requerido'
            });
        }

        const result = await pool.query(
            `UPDATE tenant_default.mobility_vehicles 
             SET status = $1 
             WHERE driver_id = $2 
             RETURNING id`,
            [available ? 'available' : 'offline', driverId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Conductor no encontrado'
            });
        }

        res.json({
            success: true,
            data: {
                driver_id: driverId,
                available: available,
                status: available ? 'available' : 'offline',
                updated_at: new Date().toISOString()
            }
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('❌ Error updating driver availability:', message);
        res.status(500).json({ success: false, error: message });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log(`🚖 M20 - Taxis y Motos corriendo en http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/health`);
    console.log(`📝 Request: http://localhost:${PORT}/api/v1/mobility/request`);
    console.log(`📝 Status: http://localhost:${PORT}/api/v1/mobility/status/{tripId}`);
    console.log(`📝 Nearby: http://localhost:${PORT}/api/v1/mobility/driver/nearby`);
    console.log(`📝 History: http://localhost:${PORT}/api/v1/mobility/history/{userId}`);
});

export default app;

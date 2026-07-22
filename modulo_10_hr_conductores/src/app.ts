import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8091;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        service: 'modulo_10_hr_conductores',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINTS DE CONDUCTORES (con PostgreSQL)
// ============================================

// GET /api/v1/drivers - Listar conductores
app.get('/api/v1/drivers', async (_req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, license_number, license_expiry, status, 
                    rating, total_trips, hire_date, emergency_contact, preferences 
             FROM tenant_default.drivers`
        );
        res.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error('❌ Error GET drivers:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/v1/drivers/:id - Obtener conductor por ID
app.get('/api/v1/drivers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT id, user_id, license_number, license_expiry, status, 
                    rating, total_trips, hire_date, emergency_contact, preferences 
             FROM tenant_default.drivers WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Conductor no encontrado' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('❌ Error GET driver:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/v1/drivers - Crear conductor
app.post('/api/v1/drivers', async (req, res) => {
    try {
        const { 
            user_id, 
            license_number, 
            license_expiry, 
            status, 
            hire_date,
            emergency_contact,
            preferences 
        } = req.body;

        if (!license_number || !license_expiry) {
            return res.status(400).json({
                success: false,
                error: 'Número de licencia y fecha de expiración son requeridos'
            });
        }

        const result = await pool.query(
            `INSERT INTO tenant_default.drivers 
             (user_id, license_number, license_expiry, status, hire_date, emergency_contact, preferences) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, user_id, license_number, license_expiry, status, 
                       rating, total_trips, hire_date, emergency_contact, preferences`,
            [
                user_id || null,
                license_number,
                license_expiry,
                status || 'available',
                hire_date || null,
                emergency_contact || null,
                preferences || null
            ]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('❌ Error POST driver:', error.message);
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                error: 'El número de licencia ya está registrado'
            });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /api/v1/drivers/:id - Actualizar conductor
app.put('/api/v1/drivers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            license_number, 
            license_expiry, 
            status, 
            rating,
            total_trips,
            emergency_contact,
            preferences 
        } = req.body;

        const result = await pool.query(
            `UPDATE tenant_default.drivers 
             SET license_number = COALESCE($1, license_number),
                 license_expiry = COALESCE($2, license_expiry),
                 status = COALESCE($3, status),
                 rating = COALESCE($4, rating),
                 total_trips = COALESCE($5, total_trips),
                 emergency_contact = COALESCE($6, emergency_contact),
                 preferences = COALESCE($7, preferences),
                 updated_at = NOW()
             WHERE id = $8
             RETURNING id, user_id, license_number, license_expiry, status, 
                       rating, total_trips, hire_date, emergency_contact, preferences`,
            [license_number, license_expiry, status, rating, total_trips, emergency_contact, preferences, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Conductor no encontrado' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('❌ Error PUT driver:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/v1/drivers/:id - Eliminar conductor
app.delete('/api/v1/drivers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM tenant_default.drivers WHERE id = $1 RETURNING id',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Conductor no encontrado' });
        }
        res.json({ success: true, message: 'Conductor eliminado correctamente' });
    } catch (error: any) {
        console.error('❌ Error DELETE driver:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/v1/drivers/:id/status - Actualizar estado del conductor
app.patch('/api/v1/drivers/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['available', 'on_trip', 'offline', 'maintenance'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Estado inválido. Permitidos: ${validStatuses.join(', ')}`
            });
        }

        const result = await pool.query(
            `UPDATE tenant_default.drivers 
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING id, status, updated_at`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Conductor no encontrado' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
        console.error('❌ Error PATCH driver status:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 M10 - HR Conductores corriendo en http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/health`);
    console.log(`📝 Drivers: http://localhost:${PORT}/api/v1/drivers`);
});

export default app;
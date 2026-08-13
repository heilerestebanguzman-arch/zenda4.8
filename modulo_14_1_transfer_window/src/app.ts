import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import redisClient from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8101;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        service: 'modulo_14_1_transfer_window',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINTS DE TRANSBORDO
// ============================================

// Obtener ventana activa de transbordo
app.get('/api/v1/transfer/window/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const key = `transfer:window:${userId}`;
        
        const data = await redisClient.get(key);
        
        if (!data) {
            return res.json({
                success: true,
                data: {
                    has_active_window: false,
                    message: 'No hay ventana de transbordo activa'
                }
            });
        }

        const windowData = JSON.parse(data);
        const elapsed = (Date.now() - windowData.timestamp) / 1000 / 60; // minutos
        const remaining = Math.max(0, 45 - elapsed);

        if (remaining <= 0) {
            await redisClient.del(key);
            return res.json({
                success: true,
                data: {
                    has_active_window: false,
                    message: 'Ventana de transbordo expirada'
                }
            });
        }

        res.json({
            success: true,
            data: {
                has_active_window: true,
                remaining_minutes: Math.round(remaining),
                route_id: windowData.route_id,
                from_route: windowData.from_route,
                transfer_number: windowData.transfer_number || 1,
                expires_at: new Date(windowData.timestamp + 45 * 60 * 1000).toISOString()
            }
        });
    } catch (error: any) {
        console.error('❌ Error getting transfer window:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Crear/actualizar ventana de transbordo
app.post('/api/v1/transfer/start', async (req, res) => {
    try {
        const { userId, routeId, fromRoute } = req.body;

        if (!userId || !routeId) {
            return res.status(400).json({
                success: false,
                error: 'userId y routeId son requeridos'
            });
        }

        const key = `transfer:window:${userId}`;
        const existing = await redisClient.get(key);
        let transferNumber = 1;

        if (existing) {
            const data = JSON.parse(existing);
            transferNumber = (data.transfer_number || 0) + 1;
        }

        const windowData = {
            user_id: userId,
            route_id: routeId,
            from_route: fromRoute || routeId,
            timestamp: Date.now(),
            transfer_number: transferNumber,
            expires_at: new Date(Date.now() + 45 * 60 * 1000).toISOString()
        };

        await redisClient.setEx(key, 2700, JSON.stringify(windowData)); // 45 minutos

        res.json({
            success: true,
            data: {
                window_started: true,
                transfer_number: transferNumber,
                expires_at: windowData.expires_at,
                discount_applicable: transferNumber >= 2
            }
        });
    } catch (error: any) {
        console.error('❌ Error starting transfer window:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Validar transbordo (para el validador)
app.post('/api/v1/transfer/validate', async (req, res) => {
    try {
        const { userId, routeId, amount } = req.body;

        if (!userId || !routeId) {
            return res.status(400).json({
                success: false,
                error: 'userId y routeId son requeridos'
            });
        }

        const key = `transfer:window:${userId}`;
        const data = await redisClient.get(key);

        if (!data) {
            // No hay ventana activa → tarifa completa
            return res.json({
                success: true,
                data: {
                    discount_applied: false,
                    final_amount: amount,
                    transfer_number: 0,
                    message: 'Sin ventana de transbordo activa'
                }
            });
        }

        const windowData = JSON.parse(data);
        const elapsed = (Date.now() - windowData.timestamp) / 1000 / 60;

        if (elapsed > 45) {
            await redisClient.del(key);
            return res.json({
                success: true,
                data: {
                    discount_applied: false,
                    final_amount: amount,
                    transfer_number: 0,
                    message: 'Ventana de transbordo expirada'
                }
            });
        }

        // Aplicar descuento según número de transbordo
        const transferNumber = windowData.transfer_number || 1;
        let discount = 0;

        if (transferNumber === 1) {
            discount = 0; // Primer viaje: tarifa completa
        } else if (transferNumber === 2) {
            discount = 50; // Segundo viaje: 50% descuento
        } else if (transferNumber >= 3) {
            discount = 100; // Tercer viaje: gratuito
        }

        const finalAmount = amount * (1 - discount / 100);

        // Actualizar número de transbordo
        windowData.transfer_number = transferNumber + 1;
        await redisClient.setEx(key, 2700, JSON.stringify(windowData));

        res.json({
            success: true,
            data: {
                discount_applied: discount > 0,
                discount_percentage: discount,
                final_amount: finalAmount,
                transfer_number: transferNumber,
                remaining_transfers: Math.max(0, 3 - transferNumber),
                message: discount > 0 ? `Descuento del ${discount}% aplicado` : 'Tarifa completa'
            }
        });
    } catch (error: any) {
        console.error('❌ Error validating transfer:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cerrar ventana de transbordo (manual)
app.delete('/api/v1/transfer/close/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const key = `transfer:window:${userId}`;
        
        await redisClient.del(key);
        
        res.json({
            success: true,
            message: 'Ventana de transbordo cerrada exitosamente'
        });
    } catch (error: any) {
        console.error('❌ Error closing transfer window:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🔄 M14.1 - Transfer Window Engine corriendo en http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/health`);
    console.log(`📝 Window: http://localhost:${PORT}/api/v1/transfer/window/{userId}`);
    console.log(`📝 Validate: http://localhost:${PORT}/api/v1/transfer/validate`);
});

export default app;

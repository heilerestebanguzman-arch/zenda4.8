import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8091;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
    return res.json({
        status: 'OK',
        service: 'modulo_10_hr_conductores',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINTS DE CONDUCTORES
// ============================================

// Obtener todos los conductores
app.get('/api/v1/drivers', async (_req, res) => {
    try {
        const drivers = [
            {
                id: '1',
                name: 'Juan Pérez',
                license: 'ABC-123',
                phone: '+591 71234567',
                status: 'available',
                rating: 4.8,
                total_trips: 45,
                vehicle: 'Toyota Corolla'
            },
            {
                id: '2',
                name: 'María Gómez',
                license: 'DEF-456',
                phone: '+591 72345678',
                status: 'on_trip',
                rating: 4.9,
                total_trips: 78,
                vehicle: 'Nissan Sentra'
            },
            {
                id: '3',
                name: 'Carlos López',
                license: 'GHI-789',
                phone: '+591 73456789',
                status: 'available',
                rating: 4.7,
                total_trips: 32,
                vehicle: 'Chevrolet Cruze'
            },
            {
                id: '4',
                name: 'Ana Martínez',
                license: 'JKL-012',
                phone: '+591 74567890',
                status: 'offline',
                rating: 4.5,
                total_trips: 12,
                vehicle: 'Ford Focus'
            }
        ];
        return res.json({ success: true, data: drivers });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Obtener un conductor por ID
app.get('/api/v1/drivers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const drivers = [
            {
                id: '1',
                name: 'Juan Pérez',
                license: 'ABC-123',
                phone: '+591 71234567',
                status: 'available',
                rating: 4.8,
                total_trips: 45,
                vehicle: 'Toyota Corolla'
            },
            {
                id: '2',
                name: 'María Gómez',
                license: 'DEF-456',
                phone: '+591 72345678',
                status: 'on_trip',
                rating: 4.9,
                total_trips: 78,
                vehicle: 'Nissan Sentra'
            },
            {
                id: '3',
                name: 'Carlos López',
                license: 'GHI-789',
                phone: '+591 73456789',
                status: 'available',
                rating: 4.7,
                total_trips: 32,
                vehicle: 'Chevrolet Cruze'
            },
            {
                id: '4',
                name: 'Ana Martínez',
                license: 'JKL-012',
                phone: '+591 74567890',
                status: 'offline',
                rating: 4.5,
                total_trips: 12,
                vehicle: 'Ford Focus'
            }
        ];
        const driver = drivers.find(d => d.id === id);
        
        if (!driver) {
            return res.status(404).json({ success: false, error: 'Conductor no encontrado' });
        }
        
        return res.json({ success: true, data: driver });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Crear un nuevo conductor
app.post('/api/v1/drivers', async (req, res) => {
    try {
        const { name, license, phone, vehicle } = req.body;
        
        if (!name || !license) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre y licencia son requeridos' 
            });
        }
        
        const newDriver = {
            id: Date.now().toString(),
            name,
            license,
            phone: phone || 'N/A',
            status: 'available',
            rating: 0,
            total_trips: 0,
            vehicle: vehicle || 'N/A',
            created_at: new Date().toISOString()
        };
        
        return res.status(201).json({ success: true, data: newDriver });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Actualizar estado de un conductor
app.patch('/api/v1/drivers/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['available', 'on_trip', 'offline'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido. Permitidos: available, on_trip, offline'
            });
        }
        
        const updatedDriver = {
            id,
            status,
            updated_at: new Date().toISOString()
        };
        
        return res.json({ success: true, data: updatedDriver });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 M10 - HR Conductores corriendo en http://localhost:${PORT}`);
    console.log(`📝 Health: http://localhost:${PORT}/health`);
    console.log(`📝 Drivers: http://localhost:${PORT}/api/v1/drivers`);
});

export default app;
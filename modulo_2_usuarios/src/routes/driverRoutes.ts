import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Obtener perfil del conductor
router.get('/driver/profile/:userId', authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // Aquí se consultaría la base de datos
    const profile = {
      id: userId,
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+591 71234567',
      license_number: 'LIC-12345',
      license_category: 'A',
      license_expiry: '2027-12-31',
      vehicle_plate: 'MOTO-001',
      vehicle_brand: 'Honda',
      vehicle_model: 'Wave',
      vehicle_year: 2023,
      vehicle_color: 'Negro',
      vehicle_type: 'MOTO',
      rating: 4.8,
      trips_completed: 156,
      acceptance_rate: 95,
      is_verified: true,
      is_available: true,
    };

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
});

// Actualizar disponibilidad del conductor
router.put('/driver/availability', authMiddleware, async (req: any, res: any) => {
  try {
    const { driverId, isAvailable } = req.body;

    // Aquí se actualizaría en la base de datos
    console.log(`🔄 Conductor ${driverId} disponible: ${isAvailable}`);

    res.json({
      success: true,
      message: `Disponibilidad actualizada a ${isAvailable}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar disponibilidad' });
  }
});

export default router;

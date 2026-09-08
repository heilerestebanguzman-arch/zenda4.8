import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import crypto from 'crypto';

const router = express.Router();

// Endpoint para alerta de pánico
router.post('/security/panic', authMiddleware, async (req: any, res: any) => {
  try {
    const { tripId, userId, encryptedLocation, encryptedAudio, timestamp } = req.body;

    // Registrar en una tabla de incidentes con cifrado
    const incidentId = `PANIC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    console.log('🚨 ALERTA DE PÁNICO:', {
      incidentId,
      tripId,
      userId,
      timestamp,
      hasAudio: !!encryptedAudio,
    });

    // Aquí se guardaría en la base de datos:
    // INSERT INTO security_incidents (id, trip_id, user_id, encrypted_location, encrypted_audio, timestamp)
    // VALUES (incidentId, tripId, userId, encryptedLocation, encryptedAudio, timestamp)

    res.json({
      success: true,
      incidentId,
      message: 'Alerta de pánico recibida y registrada',
    });
  } catch (error) {
    console.error('Error en alerta de pánico:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la alerta' });
  }
});

// Endpoint para desviación de ruta
router.post('/security/route-deviation', authMiddleware, async (req: any, res: any) => {
  try {
    const { tripId, userId, lat, lng, timestamp } = req.body;

    console.log('🚨 DESVIACIÓN DE RUTA:', {
      tripId,
      userId,
      lat,
      lng,
      timestamp,
    });

    res.json({
      success: true,
      message: 'Desviación de ruta registrada',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al procesar la desviación' });
  }
});

// Endpoint para obtener historial de incidentes
router.get('/security/incidents/:userId', authMiddleware, async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // Aquí se consultarían los incidentes de la base de datos
    res.json({
      success: true,
      data: [], // Lista de incidentes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener incidentes' });
  }
});

export default router;

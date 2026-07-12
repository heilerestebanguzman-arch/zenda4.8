import { Router } from 'express';
import { DriverController } from '../controllers/DriverController';

const router = Router();
const driverController = new DriverController();

// Ruta pública para registro de conductores
router.post('/register', driverController.register.bind(driverController));

// Rutas protegidas (se añadirán autenticación después)
router.get('/', driverController.getAll.bind(driverController));
router.get('/:id', driverController.getById.bind(driverController));
router.put('/:id/verify', driverController.verify.bind(driverController));
router.put('/:id/facial-verify', driverController.facialVerify.bind(driverController));

export default router;

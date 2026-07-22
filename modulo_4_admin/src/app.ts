import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURACIÓN DE SERVICIOS (para consultas)
// ============================================

const SERVICES = {
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3000',
  cmms: process.env.CMMS_SERVICE_URL || 'http://localhost:8087',
  drivers: process.env.DRIVERS_SERVICE_URL || 'http://localhost:8091',
  fleet: process.env.FLEET_SERVICE_URL || 'http://localhost:8081',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:8085',
  reports: process.env.REPORTS_SERVICE_URL || 'http://localhost:8094',
};

console.log('📋 Servicios disponibles para admin:');
console.log('  Users:', SERVICES.users);
console.log('  CMMS:', SERVICES.cmms);
console.log('  Drivers:', SERVICES.drivers);
console.log('  Fleet:', SERVICES.fleet);
console.log('  Payments:', SERVICES.payments);
console.log('  Reports:', SERVICES.reports);

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'modulo_4_admin',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ENDPOINTS DE ADMINISTRACIÓN
// ============================================

// 1. Dashboard de administración - Resumen del sistema
app.get('/api/v1/admin/dashboard', async (_req, res) => {
  try {
    console.log('🔄 Obteniendo resumen del sistema...');
    
    const [usersRes, routesRes, driversRes, vehiclesRes, paymentsRes] = await Promise.all([
      fetch(`${SERVICES.users}/api/v1/users`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${SERVICES.cmms}/api/v1/routes`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${SERVICES.drivers}/api/v1/drivers`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${SERVICES.fleet}/api/v1/vehicles`).then(r => r.json()).catch(() => ({ data: [] })),
      fetch(`${SERVICES.payments}/api/v1/payments`).then(r => r.json()).catch(() => ({ data: [] })),
    ]);

    const summary = {
      total_users: (usersRes as any).data?.length || 0,
      total_routes: (routesRes as any).data?.length || 0,
      total_drivers: (driversRes as any).data?.length || 0,
      total_vehicles: (vehiclesRes as any).data?.length || 0,
      total_payments: (paymentsRes as any).data?.length || 0,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    console.error('❌ Error en dashboard admin:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener resumen del sistema' 
    });
  }
});

// 2. Health check de todos los servicios (status)
app.get('/api/v1/admin/services/status', async (_req, res) => {
  try {
    console.log('🔄 Verificando estado de servicios...');
    
    const services = [
      { name: 'M2 - Usuarios', url: `${SERVICES.users}/health` },
      { name: 'M6 - CMMS', url: `${SERVICES.cmms}/health` },
      { name: 'M10 - Conductores', url: `${SERVICES.drivers}/health` },
      { name: 'M1 - Flota', url: `${SERVICES.fleet}/health` },
      { name: 'M3 - Cobro', url: `${SERVICES.payments}/health` },
      { name: 'M13 - Reportes', url: `${SERVICES.reports}/health` },
    ];

    const statuses = await Promise.all(
      services.map(async (service) => {
        try {
          const response = await fetch(service.url);
          const data = await response.json();
          return {
            name: service.name,
            status: 'online',
            url: service.url,
            response: data
          };
        } catch (error: any) {
          return {
            name: service.name,
            status: 'offline',
            url: service.url,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      data: statuses
    });
  } catch (error: any) {
    console.error('❌ Error verificando servicios:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error al verificar servicios' 
    });
  }
});

// 3. Estadísticas de usuarios
app.get('/api/v1/admin/stats/users', async (_req, res) => {
  try {
    const response = await fetch(`${SERVICES.users}/api/v1/users`);
    const data = await response.json() as any;
    const users = data.data || [];
    
    const stats = {
      total: users.length,
      admins: users.filter((u: any) => u.role === 'admin').length,
      managers: users.filter((u: any) => u.role === 'manager').length,
      drivers: users.filter((u: any) => u.role === 'driver').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas de usuarios:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener estadísticas de usuarios' 
    });
  }
});

// 4. Estadísticas de pagos
app.get('/api/v1/admin/stats/payments', async (_req, res) => {
  try {
    const response = await fetch(`${SERVICES.payments}/api/v1/payments`);
    const data = await response.json() as any;
    const payments = data.data || [];
    
    const totalAmount = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const completed = payments.filter((p: any) => p.status === 'completed');
    const pending = payments.filter((p: any) => p.status === 'pending');
    const failed = payments.filter((p: any) => p.status === 'failed');
    
    const stats = {
      total_payments: payments.length,
      total_amount: totalAmount,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      currency: payments[0]?.currency || 'USD'
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas de pagos:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener estadísticas de pagos' 
    });
  }
});

// 5. Sistema de auditoría (PostgreSQL)
app.post('/api/v1/admin/audit', async (req, res) => {
  try {
    const { action, user, details } = req.body;
    
    const result = await pool.query(
      `INSERT INTO tenant_default.audit_logs (action, user_id, entity_type, entity_id, old_data, new_data) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, action, user_id, created_at`,
      [action, user, details?.entity_type, details?.entity_id, details?.old_data, details?.new_data]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('❌ Error en auditoría:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error al registrar auditoría' 
    });
  }
});

app.get('/api/v1/admin/audit', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    const result = await pool.query(
      `SELECT id, action, user_id, entity_type, entity_id, old_data, new_data, created_at 
       FROM tenant_default.audit_logs 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rowCount
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo auditoría:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener auditoría' 
    });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`👑 M4 - Admin corriendo en http://localhost:${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/health`);
  console.log(`📝 Dashboard: http://localhost:${PORT}/api/v1/admin/dashboard`);
  console.log(`📝 Services Status: http://localhost:${PORT}/api/v1/admin/services/status`);
});

export default app;
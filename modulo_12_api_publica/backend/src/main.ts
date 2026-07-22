import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8093;

app.use(cors());
app.use(express.json());

const SERVICES = {
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3000',
  cmms: process.env.CMMS_SERVICE_URL || 'http://localhost:8087',
  drivers: process.env.DRIVERS_SERVICE_URL || 'http://localhost:8091',
  reports: process.env.REPORTS_SERVICE_URL || 'http://localhost:8094',
  fleet: process.env.FLEET_SERVICE_URL || 'http://localhost:8081',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:8085',
};

console.log('📋 Servicios configurados:');
console.log('  Users:', SERVICES.users);
console.log('  CMMS:', SERVICES.cmms);
console.log('  Drivers:', SERVICES.drivers);
console.log('  Reports:', SERVICES.reports);
console.log('  Fleet:', SERVICES.fleet);
console.log('  Payments:', SERVICES.payments);

// Health Check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'modulo_12_api_publica',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// PROXY PARA USUARIOS (M2)
// ============================================

app.get('/api/users', async (req, res) => {
  try {
    const url = `${SERVICES.users}/api/v1/users`;
    console.log(`🔄 GET Users: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Users:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de usuarios' });
    }
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const url = `${SERVICES.users}/api/v1/users`;
    console.log(`🔄 POST Users: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Users:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de usuarios' });
    }
  }
});

// ============================================
// PROXY PARA RUTAS (M6)
// ============================================

app.get('/api/routes', async (req, res) => {
  try {
    const url = `${SERVICES.cmms}/api/v1/routes`;
    console.log(`🔄 GET Routes: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Routes:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de rutas' });
    }
  }
});

app.post('/api/routes', async (req, res) => {
  try {
    const url = `${SERVICES.cmms}/api/v1/routes`;
    console.log(`🔄 POST Routes: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Routes:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de rutas' });
    }
  }
});

// ============================================
// PROXY PARA CONDUCTORES (M10)
// ============================================

app.get('/api/drivers', async (req, res) => {
  try {
    const url = `${SERVICES.drivers}/api/v1/drivers`;
    console.log(`🔄 GET Drivers: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Drivers:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de conductores' });
    }
  }
});

app.post('/api/drivers', async (req, res) => {
  try {
    const url = `${SERVICES.drivers}/api/v1/drivers`;
    console.log(`🔄 POST Drivers: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Drivers:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de conductores' });
    }
  }
});

// ============================================
// PROXY PARA FLOTA (M1)
// ============================================

app.get('/api/vehicles', async (req, res) => {
  try {
    const url = `${SERVICES.fleet}/api/v1/vehicles`;
    console.log(`🔄 GET Vehicles: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Vehicles:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de flota' });
    }
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const url = `${SERVICES.fleet}/api/v1/vehicles`;
    console.log(`🔄 POST Vehicles: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Vehicles:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de flota' });
    }
  }
});

// ============================================
// PROXY PARA COBRO (M3)
// ============================================

app.get('/api/payments', async (req, res) => {
  try {
    const url = `${SERVICES.payments}/api/v1/payments`;
    console.log(`🔄 GET Payments: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Payments:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de cobro' });
    }
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const url = `${SERVICES.payments}/api/v1/payments`;
    console.log(`🔄 POST Payments: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Payments:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de cobro' });
    }
  }
});

app.get('/api/invoices', async (req, res) => {
  try {
    const url = `${SERVICES.payments}/api/v1/invoices`;
    console.log(`🔄 GET Invoices: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Invoices:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de cobro' });
    }
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const url = `${SERVICES.payments}/api/v1/invoices`;
    console.log(`🔄 POST Invoices: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Invoices:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de cobro' });
    }
  }
});

// ============================================
// PROXY PARA ADMIN (M4)
// ============================================

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const url = `http://localhost:3001/api/v1/admin/dashboard`;
    console.log(`🔄 GET Admin Dashboard: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Admin Dashboard:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de administración' });
    }
  }
});

app.get('/api/admin/services/status', async (req, res) => {
  try {
    const url = `http://localhost:3001/api/v1/admin/services/status`;
    console.log(`🔄 GET Admin Services Status: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Admin Services Status:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de administración' });
    }
  }
});

app.get('/api/admin/stats/users', async (req, res) => {
  try {
    const url = `http://localhost:3001/api/v1/admin/stats/users`;
    console.log(`🔄 GET Admin Stats Users: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Admin Stats Users:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de administración' });
    }
  }
});

app.get('/api/admin/stats/payments', async (req, res) => {
  try {
    const url = `http://localhost:3001/api/v1/admin/stats/payments`;
    console.log(`🔄 GET Admin Stats Payments: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Admin Stats Payments:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de administración' });
    }
  }
});

app.get('/api/admin/audit', async (req, res) => {
  try {
    const url = `http://localhost:3001/api/v1/admin/audit`;
    console.log(`🔄 GET Admin Audit: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Admin Audit:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de administración' });
    }
  }
});

app.post('/api/admin/audit', async (req, res) => {
  try {
    const url = `http://localhost:3001/api/v1/admin/audit`;
    console.log(`🔄 POST Admin Audit: ${url}`);
    
    const response = await axios.post(url, req.body, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error POST Admin Audit:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de administración' });
    }
  }
});
// ============================================
// PROXY PARA ANALÍTICA (M5)
// ============================================

app.get('/api/analytics/metrics', async (req, res) => {
  try {
    const url = `http://localhost:8086/api/v1/analytics/metrics`;
    console.log(`🔄 GET Analytics Metrics: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Analytics Metrics:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de analítica' });
    }
  }
});

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const url = `http://localhost:8086/api/v1/analytics/dashboard`;
    console.log(`🔄 GET Analytics Dashboard: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('❌ Error GET Analytics Dashboard:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Error al conectar con el servicio de analítica' });
    }
  }
});

// ============================================
// 404
// ============================================

app.use('*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

app.listen(PORT, () => {
  console.log(`🚀 M12 - API Gateway corriendo en http://localhost:${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/health`);
  console.log(`📝 Proxy Users: http://localhost:${PORT}/api/users`);
  console.log(`📝 Proxy Routes: http://localhost:${PORT}/api/routes`);
  console.log(`📝 Proxy Drivers: http://localhost:${PORT}/api/drivers`);
  console.log(`📝 Proxy Vehicles: http://localhost:${PORT}/api/vehicles`);
  console.log(`📝 Proxy Payments: http://localhost:${PORT}/api/payments`);
  console.log(`📝 Proxy Invoices: http://localhost:${PORT}/api/invoices`);
  console.log(`📝 Proxy Admin Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`📝 Proxy Admin Status: http://localhost:${PORT}/api/admin/services/status`);
});

export default app;
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  return res.json({
    status: 'OK',
    service: 'modulo_2_usuarios',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// AUTENTICACIÓN (SIMULADA PARA PRUEBAS)
// ============================================

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔐 Intento de login: ${email}`);
    
    if (email === 'admin@zenda.com' && password === 'admin123') {
      const user = {
        id: '1',
        email: 'admin@zenda.com',
        name: 'Admin ZENDA',
        role: 'admin'
      };
      
      const token = 'fake-jwt-token-' + Date.now();
      
      return res.json({
        success: true,
        data: {
          user,
          accessToken: token,
          refreshToken: 'fake-refresh-token'
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }
  } catch (error: any) {
    console.error('❌ Error en login:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    
    console.log(`📝 Registro de usuario: ${email}`);
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role: role || 'citizen',
      created_at: new Date().toISOString()
    };
    
    return res.status(201).json({
      success: true,
      data: newUser
    });
  } catch (error: any) {
    console.error('❌ Error en register:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh Token
app.post('/api/v1/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token requerido'
      });
    }
    
    const newToken = 'fake-jwt-token-' + Date.now();
    
    return res.json({
      success: true,
      data: {
        accessToken: newToken,
        refreshToken: 'fake-refresh-token'
      }
    });
  } catch (error: any) {
    console.error('❌ Error en refresh:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ENDPOINTS DE USUARIOS
// ============================================

app.get('/api/v1/users', async (_req, res) => {
  try {
    const users = [
      { id: '1', name: 'Admin', email: 'admin@zenda.com', role: 'admin' },
      { id: '2', name: 'Manager', email: 'manager@zenda.com', role: 'manager' },
      { id: '3', name: 'Driver1', email: 'driver1@zenda.com', role: 'driver' },
    ];
    return res.json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = [
      { id: '1', name: 'Admin', email: 'admin@zenda.com', role: 'admin' },
      { id: '2', name: 'Manager', email: 'manager@zenda.com', role: 'manager' },
      { id: '3', name: 'Driver1', email: 'driver1@zenda.com', role: 'driver' },
    ];
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    return res.json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/v1/users', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre y email son requeridos' 
      });
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: role || 'driver',
      created_at: new Date().toISOString()
    };
    
    return res.status(201).json({ success: true, data: newUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    const updatedUser = {
      id,
      name: name || 'Usuario Actualizado',
      email: email || 'actualizado@zenda.com',
      role: role || 'driver',
      updated_at: new Date().toISOString()
    };
    
    return res.json({ success: true, data: updatedUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    return res.json({ 
      success: true, 
      message: `Usuario ${id} eliminado correctamente` 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/health`);
  console.log(`📝 Users: http://localhost:${PORT}/api/v1/users`);
});

export default app;

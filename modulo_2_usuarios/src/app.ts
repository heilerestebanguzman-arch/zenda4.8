import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req, res) => {
  return res.json({
    status: 'OK',
    service: 'modulo_2_usuarios',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ENDPOINTS DE USUARIOS
// ============================================

// Obtener todos los usuarios
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

// Obtener un usuario por ID
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

// Crear un nuevo usuario
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

// Actualizar un usuario
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

// Eliminar un usuario
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`📝 Health: http://localhost:${PORT}/health`);
  console.log(`📝 Users: http://localhost:${PORT}/api/v1/users`);
});

export default app;
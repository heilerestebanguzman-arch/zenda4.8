import axios from 'axios';

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

// ✅ CORREGIDO: Usa el proxy de Vite
const API_BASE_URL = '/api';

// ============================================
// CREAR INSTANCIA DE AXIOS
// ============================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// ============================================
// INTERCEPTOR DE SOLICITUDES (AUTENTICACIÓN)
// ============================================

api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar tenant ID
    const tenantId = localStorage.getItem('tenantId') || 'default';
    config.headers['x-tenant-id'] = tenantId;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPUESTAS (MANEJO DE ERRORES)
// ============================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response && error.response.status === 401) {
      console.warn('🔴 Sesión expirada, redirigiendo a login...');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// FUNCIONES DE API POR MÓDULO
// ============================================

// --- USUARIOS (M2) ---
export const userService = {
  // Obtener todos los usuarios
  getAll: () => api.get('/users'),
  
  // Obtener un usuario por ID
  getById: (id: string) => api.get(`/users/${id}`),
  
  // Crear un nuevo usuario
  create: (data: any) => api.post('/users', data),
  
  // Actualizar un usuario
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  
  // Eliminar un usuario
  delete: (id: string) => api.delete(`/users/${id}`),
};

// --- RUTAS (M6) ---
export const routeService = {
  // Obtener todas las rutas
  getAll: () => api.get('/routes'),
  
  // Obtener una ruta por ID
  getById: (id: string) => api.get(`/routes/${id}`),
  
  // Crear una nueva ruta
  create: (data: any) => api.post('/routes', data),
};

// --- ÓRDENES (M6) ---
export const orderService = {
  // Obtener todas las órdenes
  getAll: () => api.get('/orders'),
  
  // Crear una nueva orden
  create: (data: any) => api.post('/orders', data),
};

// --- CONDUCTORES (M10) ---
export const driverService = {
  // Obtener todos los conductores
  getAll: () => api.get('/drivers'),
  
  // Obtener un conductor por ID
  getById: (id: string) => api.get(`/drivers/${id}`),
  
  // Crear un nuevo conductor
  create: (data: any) => api.post('/drivers', data),
  
  // Actualizar estado del conductor
  updateStatus: (id: string, status: string) => api.patch(`/drivers/${id}/status`, { status }),
};

// ============================================
// EXPORTAR POR DEFECTO
// ============================================

export default api;
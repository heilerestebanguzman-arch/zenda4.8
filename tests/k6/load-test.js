import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 },    // Subida gradual a 5 usuarios
    { duration: '1m', target: 20 },    // Mantener 20 usuarios
    { duration: '30s', target: 0 },    // Bajada a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% de requests < 500ms
    errors: ['rate<0.05'],              // Tasa de error < 5%
  },
};

const BASE_URL = 'http://localhost:8093';
const LOGIN_URL = 'http://localhost:3000/api/v1/auth/login';

const testUser = {
  email: 'admin@zenda.com',
  password: 'admin123',
};

export function setup() {
  // Login y obtener token
  const response = http.post(LOGIN_URL, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'Login successful': (r) => r.status === 200,
  });

  return { token: JSON.parse(response.body).accessToken };
}

export default function (data) {
  const token = data.token;

  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'Health check status 200': (r) => r.status === 200,
  });

  // 2. Listar órdenes
  const ordersRes = http.get(`${BASE_URL}/api/v1/orders`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'list-orders' },
  });

  const success = check(ordersRes, {
    'List orders status 200': (r) => r.status === 200,
  });

  errorRate.add(!success);

  // 3. Crear orden
  const orderPayload = JSON.stringify({
    vehicle_id: `vehicle-${__VU}-${__ITER}`,
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: `Prueba carga - VU ${__VU} - Iter ${__ITER}`,
    scheduled_date: '2026-07-12T10:00:00Z',
  });

  const createRes = http.post(`${BASE_URL}/api/v1/orders`, orderPayload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    tags: { name: 'create-order' },
  });

  const createSuccess = check(createRes, {
    'Create order status 202': (r) => r.status === 202,
  });

  errorRate.add(!createSuccess);

  sleep(1);
}

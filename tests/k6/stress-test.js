import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:8093';
const LOGIN_URL = 'http://localhost:3000/api/v1/auth/login';

const testUser = {
  email: 'admin@zenda.com',
  password: 'admin123',
};

export function setup() {
  const response = http.post(LOGIN_URL, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  return { token: JSON.parse(response.body).accessToken };
}

export default function (data) {
  const token = data.token;

  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { 'Health check status 200': (r) => r.status === 200 });

  // Crear orden
  const orderPayload = JSON.stringify({
    vehicle_id: `stress-${__VU}-${__ITER}`,
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: `Prueba estrés - VU ${__VU}`,
    scheduled_date: '2026-07-12T10:00:00Z',
  });

  const createRes = http.post(`${BASE_URL}/api/v1/orders`, orderPayload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  check(createRes, {
    'Create order status 202': (r) => r.status === 202,
  });

  sleep(0.5);
}

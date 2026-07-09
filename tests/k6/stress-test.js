import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 200 },
    { duration: '2m', target: 500 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'https://localhost:8093';
const LOGIN_URL = 'https://localhost:3000/api/v1/auth/login';

const testUser = {
  email: 'admin@zenda.com',
  password: 'admin123',
};

export function setup() {
  const response = http.post(LOGIN_URL, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
    // Ignorar certificado autofirmado
    tlsAuth: [{ cert: '', key: '' }],
  });

  check(response, {
    'Login successful': (r) => r.status === 200,
  });

  return { token: JSON.parse(response.body).token };
}

export default function (data) {
  const token = data.token;

  // Crear orden
  const orderPayload = JSON.stringify({
    vehicle_id: `vehicle-${__VU}-${__ITER}`,
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: `Prueba estrés - VU ${__VU}`,
    scheduled_date: '2026-07-10T10:00:00Z',
  });

  const orderRes = http.post(
    `${BASE_URL}/api/v1/orders`,
    orderPayload,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Ignorar certificado autofirmado
      tlsAuth: [{ cert: '', key: '' }],
      tags: { name: 'create-order' },
    }
  );

  check(orderRes, {
    'Order creation status 202': (r) => r.status === 202,
  });

  sleep(0.5);
}

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.05'],
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

  check(response, {
    'Login successful': (r) => r.status === 200,
  });

  return { token: JSON.parse(response.body).token };
}

export default function (data) {
  const token = data.token;

  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'Health check status 200': (r) => r.status === 200,
  });

  const orderPayload = JSON.stringify({
    vehicle_id: `vehicle-${__VU}-${__ITER}`,
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: `Prueba de carga - VU ${__VU} - Iteración ${__ITER}`,
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
      tags: { name: 'create-order' },
    }
  );

  const success = check(orderRes, {
    'Order creation status 202': (r) => r.status === 202,
    'Order response contains request_id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('request_id');
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);

  sleep(1);
}

export function teardown(data) {
  console.log('🏁 Prueba de carga completada');
  console.log(`📊 Token usado: ${data.token.substring(0, 20)}...`);
}

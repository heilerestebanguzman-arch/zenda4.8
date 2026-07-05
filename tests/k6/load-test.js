import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },    // Subida rápida
    { duration: '20s', target: 20 },   // Pico moderado
    { duration: '10s', target: 0 },    // Bajada
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // 1. Login
  const loginRes = http.post('http://localhost:3000/api/v1/auth/login', JSON.stringify({
    email: 'admin2@zenda.com',
    password: 'admin123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
  });
  
  const token = JSON.parse(loginRes.body).token;
  
  // 2. Crear orden
  const orderRes = http.post('http://localhost:8093/api/v1/orders', JSON.stringify({
    vehicle_id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'PREVENTIVE',
    priority: 'HIGH',
    description: 'Cambio de aceite - carga',
    scheduled_date: '2026-07-10T10:00:00Z'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  check(orderRes, {
    'order status is 202': (r) => r.status === 202,
  });
  
  sleep(1);
}

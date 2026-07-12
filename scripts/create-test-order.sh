#!/bin/bash

echo "🔧 Generando orden de prueba para ZENDA 4.8..."

# Obtener token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@zenda.com", "password": "admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido"

# Crear orden con fecha fija
RESPONSE=$(curl -s -X POST http://localhost:8093/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "PREVENTIVE",
    "priority": "HIGH",
    "description": "Orden de prueba automatica",
    "scheduled_date": "2026-07-12T10:00:00Z"
  }')

echo "✅ Respuesta: $RESPONSE"

REQUEST_ID=$(echo $RESPONSE | grep -o '"request_id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$REQUEST_ID" ]; then
  echo "✅ Orden creada con ID: $REQUEST_ID"
else
  echo "❌ Error al crear la orden"
fi

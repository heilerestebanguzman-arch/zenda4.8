#!/bin/bash

# Script para probar el login y obtener token
echo "🔐 Probando login en ZENDA 4.8..."

RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@zenda.com", "password": "admin123"}')

TOKEN=$(echo $RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Token obtenido: ${TOKEN:0:50}..."
  echo "📋 Guardando token en token.txt"
  echo $TOKEN > token.txt
else
  echo "❌ Error al obtener token"
  echo "Respuesta: $RESPONSE"
fi

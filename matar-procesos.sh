#!/bin/bash

echo "=== MATANDO PROCESOS HUÉRFANOS ==="

# Matar procesos en puertos comunes
for port in 3000 8081 8093 8095 8103 3003 8082; do
  PID=$(netstat -ano | findstr :$port | findstr LISTEN | awk '{print $5}')
  if [ -n "$PID" ]; then
    echo "🔴 Matando proceso en puerto $port (PID: $PID)"
    cmd //c "taskkill /PID $PID /F" 2>/dev/null
  else
    echo "✅ Puerto $port libre"
  fi
done

echo "=== PROCESOS LIMPIOS ==="

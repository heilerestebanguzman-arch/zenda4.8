#!/bin/bash

# 1. Matar procesos en puerto 8082
PID=$(netstat -ano | findstr :8082 | findstr LISTEN | awk '{print $5}')
if [ -n "$PID" ]; then
  echo "🔴 Matando proceso en puerto 8082 (PID: $PID)"
  cmd //c "taskkill /PID $PID /F"
fi

# 2. Obtener IP
IP=$(ipconfig | grep "Dirección IPv4" | head -1 | awk '{print $NF}')
echo "📡 IP detectada: $IP"

# 3. Actualizar .env
cat > .env << ENVEOF
API_BASE=http://$IP:8093
API_USERS=http://$IP:3000
API_MOBILITY=http://$IP:8103/api/v1/mobility
EXPO_PUBLIC_API_URL=http://$IP:8093
ENVEOF
echo "✅ .env actualizado"

# 4. Actualizar IP en archivos
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i "s/[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}/$IP/g" {} \;
echo "✅ IP actualizada"

# 5. Iniciar M16
echo "🚀 Iniciando M16..."
npx expo start -c --port 8082 --host lan

#!/bin/bash

echo "🔍 DETECTANDO IP DE LA MÁQUINA..."

# Obtener IP automáticamente (prioriza Wi-Fi)
IP=$(ipconfig | grep -A 5 "Wi-Fi" | grep "Dirección IPv4" | awk '{print $NF}')

# Si no encuentra Wi-Fi, busca cualquier IPv4
if [ -z "$IP" ]; then
    IP=$(ipconfig | grep "Dirección IPv4" | head -1 | awk '{print $NF}')
fi

echo "📡 IP detectada: $IP"

# Actualizar .env
echo "📝 Actualizando .env..."
cat > .env << ENVEOF
API_BASE=http://$IP:8093
API_USERS=http://$IP:3000
API_MOBILITY=http://$IP:8103/api/v1/mobility
EXPO_PUBLIC_API_URL=http://$IP:8093
ENVEOF

echo "✅ .env actualizado"

# Actualizar IP en todos los archivos TypeScript/JavaScript
echo "📝 Actualizando IP en archivos del proyecto..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i "s/[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}/$IP/g" {} \;

echo "✅ IP actualizada en todos los archivos"

# Mostrar resumen
echo ""
echo "📋 RESUMEN DE CONFIGURACIÓN:"
echo "   IP: $IP"
echo "   API_BASE: http://$IP:8093"
echo "   API_USERS: http://$IP:3000"
echo "   API_MOBILITY: http://$IP:8103/api/v1/mobility"

echo ""
echo "🚀 INICIANDO M16..."
npx expo start -c --port 8082 --host lan

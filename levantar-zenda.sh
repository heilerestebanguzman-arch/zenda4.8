#!/bin/bash

echo "🚀 LEVANTANDO ZENDA COMPLETO"
echo ""

# 1. Matar procesos huérfanos
echo "1. Limpiando procesos..."
./matar-procesos.sh

# 2. Obtener IP actual
IP=$(ipconfig | grep "Dirección IPv4" | head -1 | awk '{print $NF}')
echo "📡 IP detectada: $IP"

# 3. Levantar servicios base
echo ""
echo "2. Levantando servicios base..."
docker-compose up -d postgres redis nats

# 4. Actualizar .env en M16
echo ""
echo "3. Actualizando .env en M16..."
cd /e/HEILER/zenda4.8/zenda4.8/modulo_16_app_ciudadana
cat > .env << ENVEOF
API_BASE=http://$IP:8093
API_USERS=http://$IP:3000
API_MOBILITY=http://$IP:8103/api/v1/mobility
EXPO_PUBLIC_API_URL=http://$IP:8093
ENVEOF
echo "✅ .env actualizado"

# 5. Actualizar IP en archivos de M16
echo ""
echo "4. Actualizando IP en archivos M16..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i "s/[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}\.[0-9]\{1,3\}/$IP/g" {} \;
echo "✅ IP actualizada"

cd /e/HEILER/zenda4.8/zenda4.8

echo ""
echo "📋 AHORA EJECUTA EN CADA TERMINAL:"
echo ""
echo "   Terminal Admin: cd modulo_1_flota && go run cmd/api/main.go"
echo "   Terminal 2: cd modulo_2_usuarios && npm run dev"
echo "   Terminal 3: cd modulo_14_recaudo_masivo && npm run dev"
echo "   Terminal 4: cd modulo_20_taxis_motos && npm run dev"
echo "   Terminal 5: cd modulo_12_api_publica/backend && npm run dev"
echo "   Terminal 6: cd modulo_17_cco_municipal && npm run dev"
echo ""
echo "5. Iniciando M16..."
cd /e/HEILER/zenda4.8/zenda4.8/modulo_16_app_ciudadana
npx expo start -c --port 8082 --host lan

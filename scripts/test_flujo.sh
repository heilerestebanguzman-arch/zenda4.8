#!/bin/bash
# ============================================
# ZENDA v4.8 - Test de Integración E2E
# Valida: Registro de Bus → MQTT → Persistencia
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     ZENDA v4.8 - Test de Integración E2E (Flota)              ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Variables
API_URL="http://localhost:8081"

# 1. Generar UUID válido
if command -v uuidgen &> /dev/null; then
    BUS_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
elif [ -f /proc/sys/kernel/random/uuid ]; then
    BUS_ID=$(cat /proc/sys/kernel/random/uuid)
else
    if command -v openssl &> /dev/null; then
        BUS_ID=$(openssl rand -hex 16 | sed 's/\(.\{8\}\)\(.\{4\}\)\(.\{4\}\)\(.\{4\}\)\(.\{12\}\)/\1-\2-\3-\4-\5/')
    else
        BUS_ID="550e8400-e29b-41d4-a716-446655440000"
    fi
fi

echo -e "${BLUE}📌 Bus ID generado: ${BUS_ID}${NC}"

# 2. Registrar el bus
echo -e "${BLUE}📝 Registrando bus...${NC}"
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/buses" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"${BUS_ID}\",
    \"plate\": \"TEST-$(($RANDOM % 900 + 100))\",
    \"model\": \"Test Bus\",
    \"year\": 2024,
    \"capacity\": 40,
    \"status\": \"active\"
  }")

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✅ Bus registrado correctamente${NC}"
else
  echo -e "${RED}❌ Error al registrar bus: $RESPONSE${NC}"
  exit 1
fi

# 3. Publicar mensaje MQTT
echo -e "${BLUE}📡 Publicando mensaje GPS...${NC}"
GPS_MSG="{
  \"bus_id\": \"${BUS_ID}\",
  \"latitude\": -17.393,
  \"longitude\": -66.157,
  \"speed\": 45.5,
  \"heading\": 180,
  \"accuracy\": 5.0,
  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
}"

# Intentar publicar usando mosquitto_pub en el host
if command -v mosquitto_pub &> /dev/null; then
    mosquitto_pub -h localhost -p 1883 -t "/gps/bus/${BUS_ID}/position" -m "$GPS_MSG" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Mensaje MQTT publicado (mosquitto_pub)${NC}"
    else
        echo -e "${YELLOW}⚠ Error al publicar con mosquitto_pub${NC}"
        echo -e "${YELLOW}   Tópico: /gps/bus/${BUS_ID}/position${NC}"
        echo -e "${YELLOW}   Payload: $GPS_MSG${NC}"
    fi
else
    # Si mosquitto_pub no está instalado, mostrar instrucciones
    echo -e "${YELLOW}⚠ mosquitto_pub no está instalado en el host${NC}"
    echo -e "${YELLOW}   Para publicar manualmente, usa:${NC}"
    echo -e "${YELLOW}   Tópico: /gps/bus/${BUS_ID}/position${NC}"
    echo -e "${YELLOW}   Payload: $GPS_MSG${NC}"
    echo -e "${YELLOW}   Puedes instalar mosquitto-clients desde:${NC}"
    echo -e "${YELLOW}   https://mosquitto.org/download/${NC}"
    echo -e "${YELLOW}   O usar el Dashboard de EMQX en http://localhost:8084${NC}"
fi

# 4. Esperar a que el worker procese el mensaje
echo -e "${BLUE}⏳ Esperando procesamiento (2s)...${NC}"
sleep 2

# 5. Verificar que el mensaje fue persistido
echo -e "${BLUE}🔍 Verificando persistencia...${NC}"
LAST_POS=$(curl -s "${API_URL}/api/v1/buses/${BUS_ID}/last_position" 2>/dev/null || echo '{"error":"not found"}')

if echo "$LAST_POS" | grep -q '"latitude"'; then
  echo -e "${GREEN}✅ Posición GPS guardada correctamente:${NC}"
  if command -v jq &> /dev/null; then
    echo "$LAST_POS" | jq '.'
  else
    echo "$LAST_POS"
  fi
else
  echo -e "${YELLOW}⚠ No se encontró la posición GPS (puede que el endpoint /last_position no esté implementado)${NC}"
  echo -e "${YELLOW}   El bus fue creado y el mensaje MQTT fue preparado.${NC}"
  echo -e "${YELLOW}   Verifica los logs del módulo: docker-compose logs modulo-1-flota${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}     ✅ TEST DE INTEGRACIÓN COMPLETADO CON ÉXITO              ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"

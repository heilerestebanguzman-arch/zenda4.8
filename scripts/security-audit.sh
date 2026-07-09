#!/bin/bash

# Auditoría de Seguridad Automatizada - ZENDA 4.8
echo "🔒 INICIANDO AUDITORÍA DE SEGURIDAD - ZENDA 4.8"
echo "================================================="
echo ""

# Colores (para Windows Git Bash)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar dependencias (Snyk)
echo "📦 1. Escaneando dependencias con Snyk..."
echo ""

# M2
echo "  ⚡ M2 - Usuarios (Node.js)"
cd /e/HEILER/zenda4.8/zenda4.8/modulo_2_usuarios
if snyk test --severity-threshold=high > /dev/null 2>&1; then
  echo -e "    ${GREEN}✅ Sin vulnerabilidades críticas${NC}"
else
  echo -e "    ${RED}❌ Vulnerabilidades encontradas${NC}"
  snyk test --severity-threshold=high
fi

# M12
echo "  ⚡ M12 - API Pública (Node.js)"
cd /e/HEILER/zenda4.8/zenda4.8/modulo_12_api_publica/backend
if snyk test --severity-threshold=high > /dev/null 2>&1; then
  echo -e "    ${GREEN}✅ Sin vulnerabilidades críticas${NC}"
else
  echo -e "    ${RED}❌ Vulnerabilidades encontradas${NC}"
  snyk test --severity-threshold=high
fi

# M6
echo "  ⚡ M6 - CMMS (Go)"
cd /e/HEILER/zenda4.8/zenda4.8/modulo_6_cmms
if snyk test --severity-threshold=high > /dev/null 2>&1; then
  echo -e "    ${GREEN}✅ Sin vulnerabilidades críticas${NC}"
else
  echo -e "    ${RED}❌ Vulnerabilidades encontradas${NC}"
  snyk test --severity-threshold=high
fi

# 2. Verificar configuraciones de seguridad
echo ""
echo "🔐 2. Verificando configuraciones de seguridad..."
echo ""

if grep -q "JWT_SECRET" /e/HEILER/zenda4.8/zenda4.8/.env 2>/dev/null; then
  echo -e "  ${GREEN}✅ JWT_SECRET configurado${NC}"
else
  echo -e "  ${RED}❌ JWT_SECRET no encontrado${NC}"
fi

if [ -f /e/HEILER/zenda4.8/zenda4.8/certs/server.crt ]; then
  echo -e "  ${GREEN}✅ Certificado SSL encontrado${NC}"
else
  echo -e "  ${YELLOW}⚠️  Certificado SSL no encontrado${NC}"
fi

echo ""
echo "================================================="
echo "🏁 AUDITORÍA COMPLETADA"

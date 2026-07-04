#!/bin/bash
# Valida docker-compose.yml antes de cada commit
echo "🔍 Validando docker-compose.yml..."
docker-compose config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ docker-compose.yml es válido"
else
    echo "❌ docker-compose.yml tiene errores"
    exit 1
fi

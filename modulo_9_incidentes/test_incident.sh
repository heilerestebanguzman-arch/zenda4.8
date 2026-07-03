#!/bin/bash
# Simular la publicación de un incidente desde el Módulo 9

# Generar un ID de incidente aleatorio
if command -v uuidgen &> /dev/null; then
    INCIDENT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
elif [ -f /proc/sys/kernel/random/uuid ]; then
    INCIDENT_ID=$(cat /proc/sys/kernel/random/uuid)
else
    INCIDENT_ID=$(openssl rand -hex 16 | sed 's/\(.\{8\}\)\(.\{4\}\)\(.\{4\}\)\(.\{4\}\)\(.\{12\}\)/\1-\2-\3-\4-\5/')
fi

# Crear el payload del incidente (compatible con NATS)
PAYLOAD=$(cat <<-END
{
  "event_type": "INCIDENT_CREATED",
  "version": "1.0.0",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "payload": {
    "incident_id": "$INCIDENT_ID",
    "bus_id": "bus-001",
    "driver_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "severity": "CRITICAL",
    "type": "PANIC_BUTTON",
    "location": {
      "latitude": -17.393,
      "longitude": -66.157
    },
    "description": "Botón de pánico activado en Ruta 1 - Centro",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
}
END
)

echo "📡 Publicando incidente en NATS..."
echo "$PAYLOAD"

# Publicar usando el endpoint HTTP de NATS
curl -s -X POST http://localhost:4222/publish/incident.created \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo ""
echo "✅ Incidente publicado: $INCIDENT_ID"
echo "📋 Para verificar logs del CRM: docker logs zenda-modulo-8-crm"

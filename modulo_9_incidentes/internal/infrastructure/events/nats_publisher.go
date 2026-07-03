package events

import (
	"encoding/json"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

type IncidentEvent struct {
	EventType string                 `json:"event_type"`
	Version   string                 `json:"version"`
	Timestamp string                 `json:"timestamp"`
	Payload   map[string]interface{} `json:"payload"`
}

type NatsEventPublisher struct {
	conn *nats.Conn
}

func NewNatsEventPublisher(url string) (*NatsEventPublisher, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, err
	}
	log.Println("✅ Módulo 9: Conectado a NATS")
	return &NatsEventPublisher{conn: nc}, nil
}

func (p *NatsEventPublisher) PublishIncidentCreated(data map[string]interface{}) error {
	event := IncidentEvent{
		EventType: "INCIDENT_CREATED",
		Version:   "1.0.0",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Payload:   data,
	}

	// Asegurar que el JSON usa UTF-8
	bytes, err := json.Marshal(event)
	if err != nil {
		return err
	}

	// Forzar que los bytes sean UTF-8 válido
	// json.Marshal ya produce UTF-8, pero aseguramos que no haya BOM ni caracteres inválidos
	// Añadir log para depuración
	log.Printf("📤 Publicando evento: %s", string(bytes))

	return p.conn.Publish("incident.created", bytes)
}

func (p *NatsEventPublisher) Close() {
	if p.conn != nil {
		p.conn.Close()
		log.Println("🛑 Módulo 9: Desconectado de NATS")
	}
}

package events

import (
	"encoding/json"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// IncidentEvent representa el evento que se publica en NATS
type IncidentEvent struct {
	EventType string                 `json:"event_type"`
	Version   string                 `json:"version"`
	Timestamp string                 `json:"timestamp"`
	Payload   map[string]interface{} `json:"payload"`
}

// NatsEventPublisher es el publicador de eventos NATS
type NatsEventPublisher struct {
	conn *nats.Conn
}

// NewNatsEventPublisher crea una nueva instancia del publicador
func NewNatsEventPublisher(url string) (*NatsEventPublisher, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, err
	}
	log.Println("✅ Módulo 9: Conectado a NATS")
	return &NatsEventPublisher{conn: nc}, nil
}

// PublishIncidentCreated publica un evento de incidente creado
func (p *NatsEventPublisher) PublishIncidentCreated(data map[string]interface{}) error {
	event := IncidentEvent{
		EventType: "INCIDENT_CREATED",
		Version:   "1.0.0",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Payload:   data,
	}

	bytes, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return p.conn.Publish("incident.created", bytes)
}

// Close cierra la conexión a NATS
func (p *NatsEventPublisher) Close() {
	if p.conn != nil {
		p.conn.Close()
		log.Println("🛑 Módulo 9: Desconectado de NATS")
	}
}

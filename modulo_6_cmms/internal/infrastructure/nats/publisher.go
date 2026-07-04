package nats

import (
    "encoding/json"
    "log"
    "time"

    "github.com/nats-io/nats.go"
)

type EventPublisher struct {
    conn *nats.Conn
}

type MaintenanceEvent struct {
    EventType   string                 `json:"event_type"`
    Version     string                 `json:"version"`
    Timestamp   string                 `json:"timestamp"`
    Payload     map[string]interface{} `json:"payload"`
}

func NewEventPublisher(url string) (*EventPublisher, error) {
    nc, err := nats.Connect(url)
    if err != nil {
        return nil, err
    }
    log.Println("✅ Módulo 6: Conectado a NATS")
    return &EventPublisher{conn: nc}, nil
}

func (p *EventPublisher) PublishOrderCreated(payload map[string]interface{}) error {
    event := MaintenanceEvent{
        EventType: "MAINTENANCE_ORDER_CREATED",
        Version:   "1.0.0",
        Timestamp: time.Now().UTC().Format(time.RFC3339),
        Payload:   payload,
    }

    data, err := json.Marshal(event)
    if err != nil {
        return err
    }

    log.Printf("📤 Publicando evento: %s", event.EventType)
    return p.conn.Publish("maintenance.order.created", data)
}

func (p *EventPublisher) PublishOrderUpdated(payload map[string]interface{}) error {
    event := MaintenanceEvent{
        EventType: "MAINTENANCE_ORDER_UPDATED",
        Version:   "1.0.0",
        Timestamp: time.Now().UTC().Format(time.RFC3339),
        Payload:   payload,
    }

    data, err := json.Marshal(event)
    if err != nil {
        return err
    }

    log.Printf("📤 Publicando evento: %s", event.EventType)
    return p.conn.Publish("maintenance.order.updated", data)
}

func (p *EventPublisher) Close() {
    if p.conn != nil {
        p.conn.Close()
        log.Println("🛑 Módulo 6: Desconectado de NATS")
    }
}

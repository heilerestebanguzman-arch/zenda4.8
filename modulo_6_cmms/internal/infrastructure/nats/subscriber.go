package nats

import (
	"encoding/json"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// OrderCreatedEvent estructura del evento que publica M12
type OrderCreatedEvent struct {
	RequestID     string `json:"request_id"`
	CorrelationID string `json:"correlation_id"`
	Timestamp     string `json:"timestamp"`
	Source        string `json:"source"`
	Data          struct {
		OrderID         string `json:"order_id"`
		UserID          string `json:"user_id"`
		VehicleID       string `json:"vehicle_id"`
		Type            string `json:"type"`
		Priority        string `json:"priority"`
		Description     string `json:"description"`
		ScheduledDate   string `json:"scheduled_date"`
		AssignedMechanicID string `json:"assigned_mechanic_id"`
	} `json:"data"`
}

// SubscribeToOrders suscribe a M6 al evento order.created
func SubscribeToOrders(nc *nats.Conn) error {
	_, err := nc.Subscribe("order.created", func(msg *nats.Msg) {
		var event OrderCreatedEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("❌ Error parsing order.created: %v", err)
			return
		}

		log.Printf("📦 [M6] Orden de mantenimiento recibida:")
		log.Printf("   📋 OrderID: %s", event.Data.OrderID)
		log.Printf("   🚗 VehicleID: %s", event.Data.VehicleID)
		log.Printf("   📝 Type: %s", event.Data.Type)
		log.Printf("   ⚡ Priority: %s", event.Data.Priority)
		log.Printf("   📅 Scheduled: %s", event.Data.ScheduledDate)
		log.Printf("   📝 Description: %s", event.Data.Description)
		log.Printf("   🔗 CorrelationID: %s", event.CorrelationID)

		// Aquí iría la lógica de negocio:
		// 1. Validar que el vehículo existe
		// 2. Crear orden en la base de datos
		// 3. Publicar evento de confirmación
		// 4. Notificar al usuario vía WebSocket

		// Por ahora, simulamos el procesamiento
		time.Sleep(1 * time.Second)
		log.Printf("✅ [M6] Orden %s procesada exitosamente", event.Data.OrderID)
	})

	if err != nil {
		return err
	}

	log.Println("✅ [M6] Suscrito a order.created")
	return nil
}

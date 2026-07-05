package usecases

import (
	"log"
	"time"

	"github.com/google/uuid"
)

type OrderData struct {
	OrderID         string
	UserID          string
	VehicleID       string
	Type            string
	Priority        string
	Description     string
	ScheduledDate   string
	AssignedMechanicID string
}

type ProcessOrderUseCase struct {
	// Aquí se inyectarían repositorios
	// vehicleRepo VehicleRepository
	// orderRepo   OrderRepository
}

func NewProcessOrderUseCase() *ProcessOrderUseCase {
	return &ProcessOrderUseCase{}
}

func (uc *ProcessOrderUseCase) Execute(order OrderData) error {
	log.Printf("🔄 [M6] Procesando orden: %s", order.OrderID)

	// Validar vehículo
	if order.VehicleID == "" {
		log.Printf("❌ VehicleID vacío")
		return nil
	}

	// Crear orden de mantenimiento (simulado)
	maintenanceOrder := map[string]interface{}{
		"id":          uuid.New().String(),
		"order_id":    order.OrderID,
		"vehicle_id":  order.VehicleID,
		"type":        order.Type,
		"priority":    order.Priority,
		"description": order.Description,
		"scheduled_date": order.ScheduledDate,
		"status":      "PENDING",
		"created_at":  time.Now().Format(time.RFC3339),
	}

	log.Printf("✅ [M6] Orden de mantenimiento creada:")
	log.Printf("   🆔 ID: %s", maintenanceOrder["id"])
	log.Printf("   📊 Status: %s", maintenanceOrder["status"])

	// Aquí se guardaría en la base de datos
	// orderRepo.Create(maintenanceOrder)

	return nil
}

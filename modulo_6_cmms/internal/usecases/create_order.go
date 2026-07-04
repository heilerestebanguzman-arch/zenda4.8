package usecases

import (
    "context"
    "fmt"
    "time"

    "github.com/google/uuid"
    "modulo_6_cmms/internal/domain"
)

type CreateOrderInput struct {
    VehicleID     uuid.UUID            `json:"vehicle_id"`
    Type          domain.OrderType     `json:"type"`
    Priority      domain.OrderPriority `json:"priority"`
    Title         string               `json:"title"`
    Description   string               `json:"description"`
    ScheduledDate *time.Time           `json:"scheduled_date"`
    EstimatedCost float64              `json:"estimated_cost"`
    Technician    string               `json:"technician"`
    Notes         string               `json:"notes"`
    CreatedBy     uuid.UUID            `json:"created_by"`
    Parts         []domain.OrderPart   `json:"parts"`
}

type CreateOrderOutput struct {
    Order *domain.MaintenanceOrder `json:"order"`
}

type EventPublisher interface {
    PublishOrderCreated(payload map[string]interface{}) error
}

type CreateOrderUseCase struct {
    orderRepo   domain.MaintenanceOrderRepository
    vehicleRepo domain.VehicleRepository
    partRepo    domain.PartRepository
    eventPub    EventPublisher
}

func NewCreateOrderUseCase(
    orderRepo domain.MaintenanceOrderRepository,
    vehicleRepo domain.VehicleRepository,
    partRepo domain.PartRepository,
    eventPub EventPublisher,
) *CreateOrderUseCase {
    return &CreateOrderUseCase{
        orderRepo:   orderRepo,
        vehicleRepo: vehicleRepo,
        partRepo:    partRepo,
        eventPub:    eventPub,
    }
}

func (uc *CreateOrderUseCase) Execute(ctx context.Context, input CreateOrderInput) (*CreateOrderOutput, error) {
    vehicle, err := uc.vehicleRepo.GetByID(ctx, input.VehicleID)
    if err != nil {
        return nil, fmt.Errorf("vehicle not found: %w", err)
    }
    if vehicle.Status == domain.VehicleInactive {
        return nil, fmt.Errorf("vehicle is inactive")
    }

    for _, p := range input.Parts {
        part, err := uc.partRepo.GetPartByID(ctx, p.PartID)
        if err != nil {
            return nil, fmt.Errorf("part not found: %w", err)
        }
        if part.Stock < p.Quantity {
            return nil, fmt.Errorf("insufficient stock for part %s: available %d, requested %d", part.Name, part.Stock, p.Quantity)
        }
    }

    order := &domain.MaintenanceOrder{
        ID:            uuid.New(),
        OrderNumber:   fmt.Sprintf("ORD-%d-%s", time.Now().UnixNano()%1000000, input.VehicleID.String()[:8]),
        VehicleID:     input.VehicleID,
        Type:          input.Type,
        Priority:      input.Priority,
        Title:         input.Title,
        Description:   input.Description,
        Status:        domain.StatusPending,
        ScheduledDate: input.ScheduledDate,
        EstimatedCost: input.EstimatedCost,
        Technician:    input.Technician,
        Notes:         input.Notes,
        CreatedBy:     input.CreatedBy,
        CreatedAt:     time.Now(),
        UpdatedAt:     time.Now(),
    }

    if err := uc.orderRepo.CreateOrder(ctx, order, input.Parts); err != nil {
        return nil, err
    }

    for _, p := range input.Parts {
        if err := uc.partRepo.UpdateStock(ctx, p.PartID, -p.Quantity); err != nil {
            return nil, err
        }
    }

    // Publicar evento NATS
    if uc.eventPub != nil {
        payload := map[string]interface{}{
            "order_id":     order.ID.String(),
            "order_number": order.OrderNumber,
            "vehicle_id":   order.VehicleID.String(),
            "type":         string(order.Type),
            "priority":     string(order.Priority),
            "title":        order.Title,
            "status":       string(order.Status),
            "created_by":   order.CreatedBy.String(),
            "created_at":   order.CreatedAt.Format(time.RFC3339),
        }
        if err := uc.eventPub.PublishOrderCreated(payload); err != nil {
            // Log del error pero no fallamos la transacción
            fmt.Printf("⚠️ Error publicando evento: %v\n", err)
        }
    }

    return &CreateOrderOutput{Order: order}, nil
}

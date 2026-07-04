package domain

import (
    "context"
    "github.com/google/uuid"
)

type VehicleRepository interface {
    Create(ctx context.Context, v *Vehicle) error
    GetByID(ctx context.Context, id uuid.UUID) (*Vehicle, error)
    GetByBusID(ctx context.Context, busID string) (*Vehicle, error)
    List(ctx context.Context) ([]Vehicle, error)
    Update(ctx context.Context, v *Vehicle) error
}

type MaintenanceOrderRepository interface {
    CreateOrder(ctx context.Context, order *MaintenanceOrder, parts []OrderPart) error
    GetOrderByID(ctx context.Context, id uuid.UUID) (*MaintenanceOrder, error)
    ListOrders(ctx context.Context, status OrderStatus, priority OrderPriority) ([]MaintenanceOrder, error)
    UpdateOrder(ctx context.Context, order *MaintenanceOrder) error
    UpdateOrderStatus(ctx context.Context, id uuid.UUID, status OrderStatus) error
}

type PartRepository interface {
    CreatePart(ctx context.Context, p *Part) error
    GetPartByID(ctx context.Context, id uuid.UUID) (*Part, error)
    GetPartByPartNumber(ctx context.Context, partNumber string) (*Part, error)
    ListParts(ctx context.Context) ([]Part, error)
    UpdateStock(ctx context.Context, id uuid.UUID, delta int) error
}

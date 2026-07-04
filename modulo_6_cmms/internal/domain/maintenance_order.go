package domain

import (
    "time"
    "github.com/google/uuid"
)

type OrderType string
type OrderPriority string
type OrderStatus string

const (
    Preventive  OrderType = "PREVENTIVE"
    Corrective  OrderType = "CORRECTIVE"
    Emergency   OrderType = "EMERGENCY"
    Inspection  OrderType = "INSPECTION"
)

const (
    PriorityLow      OrderPriority = "LOW"
    PriorityMedium   OrderPriority = "MEDIUM"
    PriorityHigh     OrderPriority = "HIGH"
    PriorityCritical OrderPriority = "CRITICAL"
)

const (
    StatusPending     OrderStatus = "PENDING"
    StatusInProgress  OrderStatus = "IN_PROGRESS"
    StatusCompleted   OrderStatus = "COMPLETED"
    StatusCancelled   OrderStatus = "CANCELLED"
    StatusApproved    OrderStatus = "APPROVED"
)

type MaintenanceOrder struct {
    ID            uuid.UUID      `json:"id"`
    OrderNumber   string         `json:"order_number"`
    VehicleID     uuid.UUID      `json:"vehicle_id"`
    Type          OrderType      `json:"type"`
    Priority      OrderPriority  `json:"priority"`
    Title         string         `json:"title"`
    Description   string         `json:"description"`
    Status        OrderStatus    `json:"status"`
    ScheduledDate *time.Time     `json:"scheduled_date"`
    CompletedDate *time.Time     `json:"completed_date"`
    EstimatedCost float64        `json:"estimated_cost"`
    ActualCost    float64        `json:"actual_cost"`
    Technician    string         `json:"technician"`
    Notes         string         `json:"notes"`
    CreatedBy     uuid.UUID      `json:"created_by"`
    CreatedAt     time.Time      `json:"created_at"`
    UpdatedAt     time.Time      `json:"updated_at"`
}

type OrderPart struct {
    PartID    uuid.UUID `json:"part_id"`
    Quantity  int       `json:"quantity"`
    UnitPrice float64   `json:"unit_price"`
}

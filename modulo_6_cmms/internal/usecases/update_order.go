package usecases

import (
    "context"
    "time"

    "github.com/google/uuid"
    "modulo_6_cmms/internal/domain"
)

type UpdateOrderInput struct {
    Status        domain.OrderStatus `json:"status"`
    ActualCost    float64            `json:"actual_cost"`
    CompletedDate *time.Time         `json:"completed_date"`
    Notes         string             `json:"notes"`
}

type UpdateOrderOutput struct {
    Order *domain.MaintenanceOrder `json:"order"`
}

type UpdateOrderUseCase struct {
    orderRepo domain.MaintenanceOrderRepository
}

func NewUpdateOrderUseCase(orderRepo domain.MaintenanceOrderRepository) *UpdateOrderUseCase {
    return &UpdateOrderUseCase{orderRepo: orderRepo}
}

func (uc *UpdateOrderUseCase) Execute(ctx context.Context, id uuid.UUID, input UpdateOrderInput) (*UpdateOrderOutput, error) {
    order, err := uc.orderRepo.GetOrderByID(ctx, id)
    if err != nil {
        return nil, err
    }
    if input.Status != ""        { order.Status = input.Status }
    if input.ActualCost > 0      { order.ActualCost = input.ActualCost }
    if input.CompletedDate != nil { order.CompletedDate = input.CompletedDate }
    if input.Notes != ""         { order.Notes = input.Notes }
    order.UpdatedAt = time.Now()

    if err := uc.orderRepo.UpdateOrder(ctx, order); err != nil {
        return nil, err
    }
    return &UpdateOrderOutput{Order: order}, nil
}

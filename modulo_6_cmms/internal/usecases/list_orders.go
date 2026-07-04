package usecases

import (
    "context"
    "modulo_6_cmms/internal/domain"
)

type ListOrdersInput struct {
    Status   domain.OrderStatus   `json:"status"`
    Priority domain.OrderPriority `json:"priority"`
}

type ListOrdersOutput struct {
    Orders []domain.MaintenanceOrder `json:"orders"`
}

type ListOrdersUseCase struct {
    orderRepo domain.MaintenanceOrderRepository
}

func NewListOrdersUseCase(orderRepo domain.MaintenanceOrderRepository) *ListOrdersUseCase {
    return &ListOrdersUseCase{orderRepo: orderRepo}
}

func (uc *ListOrdersUseCase) Execute(ctx context.Context, input ListOrdersInput) (*ListOrdersOutput, error) {
    orders, err := uc.orderRepo.ListOrders(ctx, input.Status, input.Priority)
    if err != nil {
        return nil, err
    }
    return &ListOrdersOutput{Orders: orders}, nil
}

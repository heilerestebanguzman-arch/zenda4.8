package usecases

import (
    "context"

    "github.com/google/uuid"
    "modulo_7_clearinghouse/internal/domain"
    "modulo_7_clearinghouse/internal/infrastructure/postgres"
)

type ListSettlementsInput struct {
    OperatorID uuid.UUID `json:"operator_id"`
    Status     domain.SettlementStatus `json:"status"`
}

type ListSettlementsOutput struct {
    Settlements []domain.Settlement `json:"settlements"`
}

type ListSettlementsUseCase struct {
    repo *postgres.PostgresRepository
}

func NewListSettlementsUseCase(repo *postgres.PostgresRepository) *ListSettlementsUseCase {
    return &ListSettlementsUseCase{repo: repo}
}

func (uc *ListSettlementsUseCase) Execute(ctx context.Context, input ListSettlementsInput) (*ListSettlementsOutput, error) {
    var settlements []domain.Settlement
    var err error

    if input.OperatorID != uuid.Nil {
        settlements, err = uc.repo.ListByOperator(ctx, input.OperatorID)
    } else if input.Status != "" {
        settlements, err = uc.repo.ListByStatus(ctx, input.Status)
    } else {
        return &ListSettlementsOutput{Settlements: []domain.Settlement{}}, nil
    }

    if err != nil {
        return nil, err
    }

    return &ListSettlementsOutput{Settlements: settlements}, nil
}

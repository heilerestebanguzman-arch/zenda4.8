package usecases

import (
    "context"
    "fmt"
    "time"

    "github.com/google/uuid"
    "modulo_7_clearinghouse/internal/domain"
    "modulo_7_clearinghouse/internal/infrastructure/postgres"
)

type CreateSettlementInput struct {
    OperatorID  uuid.UUID `json:"operator_id"`
    PeriodStart time.Time `json:"period_start"`
    PeriodEnd   time.Time `json:"period_end"`
    CreatedBy   uuid.UUID `json:"created_by"`
}

type CreateSettlementOutput struct {
    Settlement *domain.Settlement `json:"settlement"`
}

type CreateSettlementUseCase struct {
    repo *postgres.PostgresRepository
}

func NewCreateSettlementUseCase(repo *postgres.PostgresRepository) *CreateSettlementUseCase {
    return &CreateSettlementUseCase{repo: repo}
}

func (uc *CreateSettlementUseCase) Execute(ctx context.Context, input CreateSettlementInput) (*CreateSettlementOutput, error) {
    // Verificar que el operador existe
    operator, err := uc.repo.GetByID(ctx, input.OperatorID)
    if err != nil {
        return nil, fmt.Errorf("operator not found: %w", err)
    }

    // Obtener transacciones no liquidadas
    transactions, err := uc.repo.ListUnsettled(ctx)
    if err != nil {
        return nil, err
    }

    // Filtrar por operador
    var filtered []domain.Transaction
    var totalRides int
    var totalRevenue float64
    var totalCommission float64

    for _, t := range transactions {
        if t.OperatorID == input.OperatorID {
            filtered = append(filtered, t)
            totalRides++
            totalRevenue += t.Amount
            totalCommission += t.Commission
        }
    }

    if len(filtered) == 0 {
        return nil, fmt.Errorf("no pending transactions for operator %s", operator.Code)
    }

    // Crear liquidación
    settlement := &domain.Settlement{
        ID:               uuid.New(),
        SettlementNumber: fmt.Sprintf("SET-%d-%s", time.Now().UnixNano()%1000000, operator.Code),
        OperatorID:       input.OperatorID,
        PeriodStart:      input.PeriodStart,
        PeriodEnd:        input.PeriodEnd,
        TotalRides:       totalRides,
        TotalRevenue:     totalRevenue,
        TotalCommission:  totalCommission,
        NetAmount:        totalRevenue - totalCommission,
        Status:           domain.SettlementPending,
        Notes:            "",
        CreatedBy:        input.CreatedBy,
        CreatedAt:        time.Now(),
        UpdatedAt:        time.Now(),
    }

    if err := uc.repo.CreateSettlement(ctx, settlement); err != nil {
        return nil, err
    }

    // Asignar transacciones a la liquidación
    var transactionIDs []uuid.UUID
    for _, t := range filtered {
        transactionIDs = append(transactionIDs, t.ID)
    }

    if err := uc.repo.UpdateSettlementTransactions(ctx, settlement.ID, transactionIDs); err != nil {
        return nil, err
    }

    return &CreateSettlementOutput{Settlement: settlement}, nil
}

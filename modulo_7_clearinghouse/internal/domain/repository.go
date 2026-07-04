package domain

import (
    "context"
    "time"
    "github.com/google/uuid"
)

type OperatorRepository interface {
    Create(ctx context.Context, op *Operator) error
    GetByID(ctx context.Context, id uuid.UUID) (*Operator, error)
    GetByCode(ctx context.Context, code string) (*Operator, error)
    List(ctx context.Context) ([]Operator, error)
    Update(ctx context.Context, op *Operator) error
}

type SettlementRepository interface {
    Create(ctx context.Context, s *Settlement) error
    GetByID(ctx context.Context, id uuid.UUID) (*Settlement, error)
    GetByNumber(ctx context.Context, number string) (*Settlement, error)
    ListByOperator(ctx context.Context, operatorID uuid.UUID) ([]Settlement, error)
    ListByStatus(ctx context.Context, status SettlementStatus) ([]Settlement, error)
    ListByPeriod(ctx context.Context, start, end time.Time) ([]Settlement, error)
    Update(ctx context.Context, s *Settlement) error
    UpdateStatus(ctx context.Context, id uuid.UUID, status SettlementStatus) error
}

type TransactionRepository interface {
    Create(ctx context.Context, t *Transaction) error
    CreateBatch(ctx context.Context, transactions []Transaction) error
    GetBySettlement(ctx context.Context, settlementID uuid.UUID) ([]Transaction, error)
    GetByOperator(ctx context.Context, operatorID uuid.UUID) ([]Transaction, error)
    GetByRideID(ctx context.Context, rideID string) (*Transaction, error)
    ListUnsettled(ctx context.Context) ([]Transaction, error)
    UpdateSettlement(ctx context.Context, settlementID uuid.UUID, transactionIDs []uuid.UUID) error
}

package domain

import (
	"context"

	"github.com/google/uuid"
)

type WalletRepository interface {
	Create(ctx context.Context, wallet *Wallet) error
	GetByID(ctx context.Context, id uuid.UUID) (*Wallet, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) (*Wallet, error)
	Update(ctx context.Context, wallet *Wallet) error
	UpdateBalance(ctx context.Context, id uuid.UUID, newBalance float64) error
}

type TransactionRepository interface {
	Create(ctx context.Context, tx *Transaction) error
	GetByWalletID(ctx context.Context, walletID uuid.UUID, limit, offset int) ([]Transaction, error)
	GetByID(ctx context.Context, id uuid.UUID) (*Transaction, error)
}

type RechargeOrderRepository interface {
	Create(ctx context.Context, order *RechargeOrder) error
	GetByID(ctx context.Context, id uuid.UUID) (*RechargeOrder, error)
	Update(ctx context.Context, order *RechargeOrder) error
	GetByWalletID(ctx context.Context, walletID uuid.UUID) ([]RechargeOrder, error)
}

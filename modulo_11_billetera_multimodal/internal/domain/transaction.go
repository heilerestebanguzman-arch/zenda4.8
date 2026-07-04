package domain

import (
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID            uuid.UUID  `json:"id"`
	WalletID      uuid.UUID  `json:"wallet_id"`
	Type          string     `json:"type"`
	Amount        float64    `json:"amount"`
	BalanceBefore float64    `json:"balance_before"`
	BalanceAfter  float64    `json:"balance_after"`
	Description   string     `json:"description"`
	ReferenceID   *uuid.UUID `json:"reference_id,omitempty"`
	Status        string     `json:"status"`
	CreatedAt     time.Time  `json:"created_at"`
}

type TransactionType string

const (
	TransactionTypeRecharge  TransactionType = "RECHARGE"
	TransactionTypePayment   TransactionType = "PAYMENT"
	TransactionTypeTransfer  TransactionType = "TRANSFER"
	TransactionTypeRefund    TransactionType = "REFUND"
)

type TransactionStatus string

const (
	TransactionStatusPending   TransactionStatus = "PENDING"
	TransactionStatusCompleted TransactionStatus = "COMPLETED"
	TransactionStatusFailed    TransactionStatus = "FAILED"
)

package domain

import (
	"time"

	"github.com/google/uuid"
)

type RechargeOrder struct {
	ID               uuid.UUID  `json:"id"`
	WalletID         uuid.UUID  `json:"wallet_id"`
	Amount           float64    `json:"amount"`
	PaymentMethod    string     `json:"payment_method"`
	PaymentReference string     `json:"payment_reference,omitempty"`
	Status           string     `json:"status"`
	PaidAt           *time.Time `json:"paid_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type RechargeStatus string

const (
	RechargeStatusPending   RechargeStatus = "PENDING"
	RechargeStatusPaid      RechargeStatus = "PAID"
	RechargeStatusFailed    RechargeStatus = "FAILED"
	RechargeStatusCancelled RechargeStatus = "CANCELLED"
)

type PaymentMethod string

const (
	PaymentMethodCreditCard PaymentMethod = "CREDIT_CARD"
	PaymentMethodDebit      PaymentMethod = "DEBIT"
	PaymentMethodQR         PaymentMethod = "QR"
	PaymentMethodCash       PaymentMethod = "CASH"
)

package domain

import (
	"time"

	"github.com/google/uuid"
)

type Wallet struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Balance   float64   `json:"balance"`
	Currency  string    `json:"currency"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type WalletStatus string

const (
	WalletStatusActive  WalletStatus = "ACTIVE"
	WalletStatusFrozen  WalletStatus = "FROZEN"
	WalletStatusClosed  WalletStatus = "CLOSED"
)

type WalletCurrency string

const (
	CurrencyBOB WalletCurrency = "BOB"
	CurrencyUSD WalletCurrency = "USD"
)

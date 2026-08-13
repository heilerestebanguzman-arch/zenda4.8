package entities

import (
    "time"
    "github.com/google/uuid"
)

type OfflineTransaction struct {
    ID          string    `json:"id"`
    BusID       string    `json:"bus_id"`
    ValidatorID string    `json:"validator_id"`
    UserID      string    `json:"user_id"`
    Amount      float64   `json:"amount"`
    Timestamp   int64     `json:"timestamp"`
    Synced      bool      `json:"synced"`
    Signature   string    `json:"signature"`
    CreatedAt   time.Time `json:"created_at"`
}

type BalanceCache struct {
    UserID     string    `json:"user_id"`
    Balance    float64   `json:"balance"`
    LastUpdate time.Time `json:"last_update"`
    Signature  string    `json:"signature"`
}

type LocalBlacklist struct {
    UserID    string    `json:"user_id"`
    Reason    string    `json:"reason"`
    ExpiresAt time.Time `json:"expires_at"`
}

func NewOfflineTransaction(busID, validatorID, userID string, amount float64) *OfflineTransaction {
    now := time.Now().UTC()
    return &OfflineTransaction{
        ID:          uuid.New().String(),
        BusID:       busID,
        ValidatorID: validatorID,
        UserID:      userID,
        Amount:      amount,
        Timestamp:   now.Unix(),
        Synced:      false,
        CreatedAt:   now,
    }
}

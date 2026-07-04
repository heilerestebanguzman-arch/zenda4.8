package domain

import (
    "time"
    "github.com/google/uuid"
)

type TransactionType string
type TransactionStatus string

const (
    Ride      TransactionType = "RIDE"
    Refund    TransactionType = "REFUND"
    Adjustment TransactionType = "ADJUSTMENT"
)

const (
    TransPending   TransactionStatus = "PENDING"
    TransSettled   TransactionStatus = "SETTLED"
    TransCancelled TransactionStatus = "CANCELLED"
)

type Transaction struct {
    ID           uuid.UUID          `json:"id"`
    SettlementID *uuid.UUID         `json:"settlement_id"`
    RideID       string             `json:"ride_id"`
    OperatorID   uuid.UUID          `json:"operator_id"`
    PassengerID  *uuid.UUID         `json:"passenger_id"`
    Amount       float64            `json:"amount"`
    Commission   float64            `json:"commission"`
    Type         TransactionType    `json:"type"`
    Status       TransactionStatus  `json:"status"`
    CreatedAt    time.Time          `json:"created_at"`
}

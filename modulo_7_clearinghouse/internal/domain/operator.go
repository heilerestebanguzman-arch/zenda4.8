package domain

import (
    "time"
    "github.com/google/uuid"
)

type OperatorStatus string

const (
    OperatorActive   OperatorStatus = "ACTIVE"
    OperatorInactive OperatorStatus = "INACTIVE"
)

type Operator struct {
    ID             uuid.UUID       `json:"id"`
    Name           string          `json:"name"`
    Code           string          `json:"code"`
    CommissionRate float64         `json:"commission_rate"`
    ContactEmail   string          `json:"contact_email"`
    ContactPhone   string          `json:"contact_phone"`
    Status         OperatorStatus  `json:"status"`
    CreatedAt      time.Time       `json:"created_at"`
    UpdatedAt      time.Time       `json:"updated_at"`
}

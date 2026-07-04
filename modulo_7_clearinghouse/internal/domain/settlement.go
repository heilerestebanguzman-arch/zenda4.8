package domain

import (
    "time"
    "github.com/google/uuid"
)

type SettlementStatus string

const (
    SettlementPending   SettlementStatus = "PENDING"
    SettlementApproved  SettlementStatus = "APPROVED"
    SettlementPaid      SettlementStatus = "PAID"
    SettlementCancelled SettlementStatus = "CANCELLED"
)

type Settlement struct {
    ID               uuid.UUID        `json:"id"`
    SettlementNumber string           `json:"settlement_number"`
    OperatorID       uuid.UUID        `json:"operator_id"`
    PeriodStart      time.Time        `json:"period_start"`
    PeriodEnd        time.Time        `json:"period_end"`
    TotalRides       int              `json:"total_rides"`
    TotalRevenue     float64          `json:"total_revenue"`
    TotalCommission  float64          `json:"total_commission"`
    NetAmount        float64          `json:"net_amount"`
    Status           SettlementStatus `json:"status"`
    PaymentDate      *time.Time       `json:"payment_date"`
    Notes            string           `json:"notes"`
    CreatedBy        uuid.UUID        `json:"created_by"`
    CreatedAt        time.Time        `json:"created_at"`
    UpdatedAt        time.Time        `json:"updated_at"`
}

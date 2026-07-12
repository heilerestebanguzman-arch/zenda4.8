package services

import (
    "github.com/nats-io/nats.go"
)

type OrderService struct {
    nc *nats.Conn
}

func NewOrderService(nc *nats.Conn) *OrderService {
    return &OrderService{nc: nc}
}

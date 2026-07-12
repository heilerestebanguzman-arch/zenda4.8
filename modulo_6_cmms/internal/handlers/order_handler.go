package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "modulo_6_cmms/internal/services"
)

type OrderHandler struct {
    service *services.OrderService
}

func NewOrderHandler(service *services.OrderService) *OrderHandler {
    return &OrderHandler{service: service}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
    c.JSON(http.StatusAccepted, gin.H{
        "status":  "accepted",
        "message": "Orden recibida y en procesamiento",
    })
}

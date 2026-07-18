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

// ListOrders maneja GET /api/v1/orders
func (h *OrderHandler) ListOrders(c *gin.Context) {
    // TODO: Implementar listado de órdenes desde la base de datos
    // Por ahora, devolvemos un array vacío
    c.JSON(http.StatusOK, gin.H{
        "status": "ok",
        "data":   []interface{}{},
    })
}

// CreateOrder maneja POST /api/v1/orders
func (h *OrderHandler) CreateOrder(c *gin.Context) {
    c.JSON(http.StatusAccepted, gin.H{
        "status":  "accepted",
        "message": "Orden recibida y en procesamiento",
    })
}

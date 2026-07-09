package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

type MockOrderService struct {
    mock.Mock
}

func (m *MockOrderService) ProcessOrder(order Order) error {
    args := m.Called(order)
    return args.Error(0)
}

func TestOrderHandler_CreateOrder(t *testing.T) {
    gin.SetMode(gin.TestMode)

    t.Run("should return 202 Accepted for valid order", func(t *testing.T) {
        mockService := new(MockOrderService)
        handler := NewOrderHandler(mockService)

        order := Order{
            VehicleID: "123e4567-e89b-12d3-a456-426614174000",
            Type:      "PREVENTIVE",
            Priority:  "HIGH",
            Description: "Cambio de aceite",
        }

        mockService.On("ProcessOrder", order).Return(nil)

        w := httptest.NewRecorder()
        c, _ := gin.CreateTestContext(w)

        body, _ := json.Marshal(order)
        c.Request = httptest.NewRequest("POST", "/api/v1/orders", bytes.NewBuffer(body))
        c.Request.Header.Set("Content-Type", "application/json")

        handler.CreateOrder(c)

        assert.Equal(t, http.StatusAccepted, w.Code)
        mockService.AssertExpectations(t)
    })

    t.Run("should return 400 for invalid order", func(t *testing.T) {
        mockService := new(MockOrderService)
        handler := NewOrderHandler(mockService)

        w := httptest.NewRecorder()
        c, _ := gin.CreateTestContext(w)

        invalidOrder := `{"vehicle_id": "invalid-uuid"}`
        c.Request = httptest.NewRequest("POST", "/api/v1/orders", bytes.NewBufferString(invalidOrder))
        c.Request.Header.Set("Content-Type", "application/json")

        handler.CreateOrder(c)

        assert.Equal(t, http.StatusBadRequest, w.Code)
        mockService.AssertNotCalled(t, "ProcessOrder")
    })
}

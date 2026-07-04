package handlers

import (
    "encoding/json"
    "net/http"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "modulo_6_cmms/internal/domain"
    "modulo_6_cmms/internal/usecases"
)

type Handlers struct {
    createOrderUC *usecases.CreateOrderUseCase
    listOrdersUC  *usecases.ListOrdersUseCase
    updateOrderUC *usecases.UpdateOrderUseCase
    dbPing        func() error
}

func NewHandlers(
    createOrderUC *usecases.CreateOrderUseCase,
    listOrdersUC  *usecases.ListOrdersUseCase,
    updateOrderUC *usecases.UpdateOrderUseCase,
    dbPing func() error,
) *Handlers {
    return &Handlers{
        createOrderUC: createOrderUC,
        listOrdersUC:  listOrdersUC,
        updateOrderUC: updateOrderUC,
        dbPing:        dbPing,
    }
}

func (h *Handlers) HealthCheck(w http.ResponseWriter, r *http.Request) {
    status := "ok"
    dbStatus := "ok"

    if err := h.dbPing(); err != nil {
        dbStatus = "unhealthy"
        status = "degraded"
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status":    status,
        "service":   "modulo_6_cmms",
        "database":  dbStatus,
        "timestamp": time.Now().UTC().Format(time.RFC3339),
    })
}

func (h *Handlers) CreateOrder(w http.ResponseWriter, r *http.Request) {
    var input usecases.CreateOrderInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    output, err := h.createOrderUC.Execute(r.Context(), input)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(output)
}

func (h *Handlers) ListOrders(w http.ResponseWriter, r *http.Request) {
    status := r.URL.Query().Get("status")
    priority := r.URL.Query().Get("priority")

    output, err := h.listOrdersUC.Execute(r.Context(), usecases.ListOrdersInput{
        Status:   domain.OrderStatus(status),
        Priority: domain.OrderPriority(priority),
    })
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(output)
}

func (h *Handlers) UpdateOrder(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := uuid.Parse(vars["id"])
    if err != nil {
        http.Error(w, "Invalid order ID", http.StatusBadRequest)
        return
    }
    var input usecases.UpdateOrderInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }
    output, err := h.updateOrderUC.Execute(r.Context(), id, input)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(output)
}

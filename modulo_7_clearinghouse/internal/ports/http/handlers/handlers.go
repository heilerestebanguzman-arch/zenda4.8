package handlers

import (
    "encoding/json"
    "net/http"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "modulo_7_clearinghouse/internal/domain"
    "modulo_7_clearinghouse/internal/usecases"
)

type Handlers struct {
    createSettlementUC *usecases.CreateSettlementUseCase
    listSettlementsUC  *usecases.ListSettlementsUseCase
    dbPing             func() error
}

func NewHandlers(
    createSettlementUC *usecases.CreateSettlementUseCase,
    listSettlementsUC  *usecases.ListSettlementsUseCase,
    dbPing func() error,
) *Handlers {
    return &Handlers{
        createSettlementUC: createSettlementUC,
        listSettlementsUC:  listSettlementsUC,
        dbPing:             dbPing,
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
        "service":   "modulo_7_clearinghouse",
        "database":  dbStatus,
        "timestamp": time.Now().UTC().Format(time.RFC3339),
    })
}

func (h *Handlers) CreateSettlement(w http.ResponseWriter, r *http.Request) {
    var input usecases.CreateSettlementInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    output, err := h.createSettlementUC.Execute(r.Context(), input)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(output)
}

func (h *Handlers) ListSettlements(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    input := usecases.ListSettlementsInput{}

    if operatorIDStr, ok := vars["operator_id"]; ok && operatorIDStr != "" {
        id, err := uuid.Parse(operatorIDStr)
        if err == nil {
            input.OperatorID = id
        }
    }

    if status := r.URL.Query().Get("status"); status != "" {
        input.Status = domain.SettlementStatus(status)
    }

    output, err := h.listSettlementsUC.Execute(r.Context(), input)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(output)
}

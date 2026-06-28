package http

import (
	"encoding/json"
	"net/http"

	"github.com/zenda/modulo_1_flota/internal/domain"
	"github.com/zenda/modulo_1_flota/internal/ports"
)

type BusHandler struct {
	repo   domain.BusRepository
	metrics *ports.Metrics
}

func NewBusHandler(repo domain.BusRepository, metrics *ports.Metrics) *BusHandler {
	return &BusHandler{
		repo:   repo,
		metrics: metrics,
	}
}

func (h *BusHandler) CreateBus(w http.ResponseWriter, r *http.Request) {
	var bus domain.Bus
	if err := json.NewDecoder(r.Body).Decode(&bus); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if bus.ID == "" {
		http.Error(w, "Bus ID is required", http.StatusBadRequest)
		return
	}

	if err := h.repo.Save(r.Context(), &bus); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "ok",
		"message": "Bus creado exitosamente",
		"bus":     bus,
	})
}

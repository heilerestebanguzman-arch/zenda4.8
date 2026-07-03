package rest

import (
	"encoding/json"
	"net/http"

	"modulo_9_incidentes/internal/application"
)

// IncidentHandler maneja las peticiones HTTP relacionadas con incidentes
type IncidentHandler struct {
	createIncidentUC *application.CreateIncidentUseCase
}

// NewIncidentHandler crea una nueva instancia del handler
func NewIncidentHandler(createIncidentUC *application.CreateIncidentUseCase) *IncidentHandler {
	return &IncidentHandler{
		createIncidentUC: createIncidentUC,
	}
}

// CreateIncident maneja la creación de un incidente (botón de pánico)
func (h *IncidentHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input application.CreateIncidentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validar campos obligatorios
	if input.BusID == "" {
		http.Error(w, "bus_id is required", http.StatusBadRequest)
		return
	}
	if input.Type == "" {
		http.Error(w, "type is required", http.StatusBadRequest)
		return
	}
	if input.Severity == "" {
		http.Error(w, "severity is required", http.StatusBadRequest)
		return
	}

	incident, err := h.createIncidentUC.Execute(input)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "ok",
		"incident": incident,
	})
}

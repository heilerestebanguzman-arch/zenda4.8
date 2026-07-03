package rest

import (
	"encoding/json"
	"net/http"

	"modulo_9_incidentes/internal/application"
)

type IncidentHandler struct {
	createIncidentUC *application.CreateIncidentUseCase
}

func NewIncidentHandler(createIncidentUC *application.CreateIncidentUseCase) *IncidentHandler {
	return &IncidentHandler{
		createIncidentUC: createIncidentUC,
	}
}

func (h *IncidentHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 🔥 SOLUCIÓN: Usar json.Decoder con UTF-8 forzado
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	var input application.CreateIncidentInput
	if err := decoder.Decode(&input); err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

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

	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusCreated)

	encoder := json.NewEncoder(w)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")
	encoder.Encode(map[string]interface{}{
		"status":   "ok",
		"incident": incident,
	})
}

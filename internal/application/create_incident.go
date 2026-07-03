package application

import (
	"time"

	"github.com/google/uuid"
)

// Incident representa un incidente de seguridad
type Incident struct {
	ID          string    `json:"id"`
	BusID       string    `json:"bus_id"`
	DriverID    string    `json:"driver_id"`
	Type        string    `json:"type"`
	Severity    string    `json:"severity"`
	Location    Location  `json:"location"`
	Description string    `json:"description"`
	Timestamp   time.Time `json:"timestamp"`
}

// Location representa una ubicación geográfica
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// CreateIncidentInput es el DTO de entrada
type CreateIncidentInput struct {
	BusID       string   `json:"bus_id"`
	DriverID    string   `json:"driver_id"`
	Type        string   `json:"type"`
	Severity    string   `json:"severity"`
	Location    Location `json:"location"`
	Description string   `json:"description"`
}

// CreateIncidentUseCase maneja la creación de incidentes
type CreateIncidentUseCase struct {
	publisher interface {
		PublishIncidentCreated(data map[string]interface{}) error
	}
}

// NewCreateIncidentUseCase crea una nueva instancia del caso de uso
func NewCreateIncidentUseCase(publisher interface {
	PublishIncidentCreated(data map[string]interface{}) error
}) *CreateIncidentUseCase {
	return &CreateIncidentUseCase{
		publisher: publisher,
	}
}

// Execute crea un incidente y publica el evento
func (uc *CreateIncidentUseCase) Execute(input CreateIncidentInput) (*Incident, error) {
	incident := &Incident{
		ID:          uuid.New().String(),
		BusID:       input.BusID,
		DriverID:    input.DriverID,
		Type:        input.Type,
		Severity:    input.Severity,
		Location:    input.Location,
		Description: input.Description,
		Timestamp:   time.Now().UTC(),
	}

	// Preparar payload para NATS
	payload := map[string]interface{}{
		"incident_id": incident.ID,
		"bus_id":      incident.BusID,
		"driver_id":   incident.DriverID,
		"type":        incident.Type,
		"severity":    incident.Severity,
		"location": map[string]float64{
			"latitude":  incident.Location.Latitude,
			"longitude": incident.Location.Longitude,
		},
		"description": incident.Description,
		"timestamp":   incident.Timestamp.Format(time.RFC3339),
	}

	// Publicar evento en NATS
	if err := uc.publisher.PublishIncidentCreated(payload); err != nil {
		return nil, err
	}

	return incident, nil
}

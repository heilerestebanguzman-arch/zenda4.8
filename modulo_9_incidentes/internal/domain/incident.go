package domain

import (
	"time"

	"github.com/google/uuid"
)

type IncidentType string

const (
	IncidentTypePanic       IncidentType = "PANIC_BUTTON"
	IncidentTypeCollision   IncidentType = "COLLISION"
	IncidentTypeMechanical  IncidentType = "MECHANICAL"
	IncidentTypeAcceleration IncidentType = "ACCELERATION"
	IncidentTypeFatigue     IncidentType = "FATIGUE"
)

type IncidentSeverity string

const (
	SeverityLow      IncidentSeverity = "LOW"
	SeverityMedium   IncidentSeverity = "MEDIUM"
	SeverityHigh     IncidentSeverity = "HIGH"
	SeverityCritical IncidentSeverity = "CRITICAL"
)

type IncidentStatus string

const (
	StatusCreated    IncidentStatus = "CREATED"
	StatusInProgress IncidentStatus = "IN_PROGRESS"
	StatusResolved   IncidentStatus = "RESOLVED"
	StatusClosed     IncidentStatus = "CLOSED"
)

type Incident struct {
	ID          string          `json:"id"`
	BusID       string          `json:"bus_id"`
	DriverID    string          `json:"driver_id"`
	Type        IncidentType    `json:"type"`
	Severity    IncidentSeverity `json:"severity"`
	Status      IncidentStatus  `json:"status"`
	Location    Location        `json:"location"`
	Description string          `json:"description"`
	ReportedAt  time.Time       `json:"reported_at"`
	ResolvedAt  *time.Time      `json:"resolved_at,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func NewIncident(busID, driverID string, incidentType IncidentType, severity IncidentSeverity, location Location, description string) *Incident {
	now := time.Now()
	return &Incident{
		ID:          uuid.New().String(),
		BusID:       busID,
		DriverID:    driverID,
		Type:        incidentType,
		Severity:    severity,
		Status:      StatusCreated,
		Location:    location,
		Description: description,
		ReportedAt:  now,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

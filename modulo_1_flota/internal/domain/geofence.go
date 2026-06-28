package domain

import (
	"time"
)

type GeofenceType string

const (
	GeofenceTypeTerminal GeofenceType = "terminal"
	GeofenceTypeGarage   GeofenceType = "garage"
	GeofenceTypeRestArea GeofenceType = "rest_area"
)

type Geofence struct {
	ID        string       `json:"id"`
	Name      string       `json:"name"`
	Type      GeofenceType `json:"type"`
	Polygon   [][]float64  `json:"polygon"`
	Radius    *float64     `json:"radius,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

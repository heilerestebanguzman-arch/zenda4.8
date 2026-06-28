package domain

import (
	"time"
)

type BusStatus string

const (
	BusStatusActive     BusStatus = "active"
	BusStatusInactive   BusStatus = "inactive"
	BusStatusMaintenance BusStatus = "maintenance"
)

type Bus struct {
	ID           string     `json:"id"`
	Plate        string     `json:"plate"`
	Model        string     `json:"model"`
	Year         int        `json:"year"`
	Capacity     int        `json:"capacity"`
	Status       BusStatus  `json:"status"`
	RouteID      *string    `json:"route_id,omitempty"`
	DriverID     *string    `json:"driver_id,omitempty"`
	LastPosition *Location  `json:"last_position,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func NewBus(plate, model string, year, capacity int) *Bus {
	now := time.Now()
	return &Bus{
		Plate:     plate,
		Model:     model,
		Year:      year,
		Capacity:  capacity,
		Status:    BusStatusInactive,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (b *Bus) IsActive() bool {
	return b.Status == BusStatusActive
}

func (b *Bus) AssignRoute(routeID string) {
	b.RouteID = &routeID
	b.UpdatedAt = time.Now()
}

func (b *Bus) AssignDriver(driverID string) {
	b.DriverID = &driverID
	b.UpdatedAt = time.Now()
}

func (b *Bus) UpdateStatus(status BusStatus) {
	b.Status = status
	b.UpdatedAt = time.Now()
}

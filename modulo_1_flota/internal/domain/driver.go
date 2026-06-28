package domain

import (
	"time"
)

type DriverStatus string

const (
	DriverStatusAvailable DriverStatus = "available"
	DriverStatusOnRoute   DriverStatus = "on_route"
	DriverStatusOffDuty   DriverStatus = "off_duty"
)

type Driver struct {
	ID        string       `json:"id"`
	FullName  string       `json:"full_name"`
	License   string       `json:"license"`
	Phone     string       `json:"phone"`
	Status    DriverStatus `json:"status"`
	BusID     *string      `json:"bus_id,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

func (d *Driver) IsAvailable() bool {
	return d.Status == DriverStatusAvailable
}

func (d *Driver) AssignBus(busID string) {
	d.BusID = &busID
	d.UpdatedAt = time.Now()
}

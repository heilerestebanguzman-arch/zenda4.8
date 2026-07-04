package domain

import (
    "time"
    "github.com/google/uuid"
)

type VehicleStatus string

const (
    VehicleActive      VehicleStatus = "ACTIVE"
    VehicleMaintenance VehicleStatus = "MAINTENANCE"
    VehicleInactive    VehicleStatus = "INACTIVE"
)

type Vehicle struct {
    ID        uuid.UUID     `json:"id"`
    BusID     string        `json:"bus_id"`
    Brand     string        `json:"brand"`
    Model     string        `json:"model"`
    Year      int           `json:"year"`
    Plate     string        `json:"plate"`
    Mileage   int           `json:"mileage"`
    Status    VehicleStatus `json:"status"`
    CreatedAt time.Time     `json:"created_at"`
    UpdatedAt time.Time     `json:"updated_at"`
}

package domain

import (
	"time"
)

type Stop struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Location    Location  `json:"location"`
	Order       int       `json:"order"`
	RouteID     string    `json:"route_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

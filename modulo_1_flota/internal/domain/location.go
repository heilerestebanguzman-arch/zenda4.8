package domain

import (
	"time"
)

type Location struct {
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Speed     float64   `json:"speed,omitempty"`
	Heading   int       `json:"heading,omitempty"`
	Accuracy  float64   `json:"accuracy,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

func (l *Location) IsValid() bool {
	return l.Latitude >= -90 && l.Latitude <= 90 &&
		l.Longitude >= -180 && l.Longitude <= 180
}

func (l *Location) IsMoving() bool {
	return l.Speed > 1.0
}

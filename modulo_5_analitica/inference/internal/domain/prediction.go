package domain

import "time"

type ETAPrediction struct {
    BusID        string    `json:"bus_id"`
    RouteID      string    `json:"route_id"`
    CurrentLat   float64   `json:"current_lat"`
    CurrentLng   float64   `json:"current_lng"`
    NextStopLat  float64   `json:"next_stop_lat"`
    NextStopLng  float64   `json:"next_stop_lng"`
    ETA          int       `json:"eta_seconds"`
    Confidence   float64   `json:"confidence"`
    PredictedAt  time.Time `json:"predicted_at"`
}

type DemandPrediction struct {
    RouteID        string    `json:"route_id"`
    PredictedAt    time.Time `json:"predicted_at"`
    PredictedCount int       `json:"predicted_count"`
    Hour           int       `json:"hour"`
}

type ETAFactors struct {
    SpeedFactor    float64   `json:"speed_factor"`
    TrafficFactor  float64   `json:"traffic_factor"`
    WeatherFactor  float64   `json:"weather_factor"`
    UpdatedAt      time.Time `json:"updated_at"`
}

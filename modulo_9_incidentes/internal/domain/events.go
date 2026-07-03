package domain

type IncidentCreatedEvent struct {
	EventType string `json:"event_type"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
	Payload   struct {
		IncidentID  string          `json:"incident_id"`
		BusID       string          `json:"bus_id"`
		DriverID    string          `json:"driver_id"`
		Severity    IncidentSeverity `json:"severity"`
		Type        IncidentType    `json:"type"`
		Location    Location        `json:"location"`
		Description string          `json:"description"`
		Timestamp   string          `json:"timestamp"`
	} `json:"payload"`
}

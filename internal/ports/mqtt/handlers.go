package mqtt

import (
	"context"
	"log/slog"

	"github.com/zenda/modulo_1_flota/internal/domain"
	"github.com/zenda/modulo_1_flota/internal/infrastructure/mqtt"
	"github.com/zenda/modulo_1_flota/internal/ports"
)

type GPSHandler struct {
	locationRepo domain.LocationRepository
	metrics      *ports.Metrics
	logger       *slog.Logger
}

func NewGPSHandler(locationRepo domain.LocationRepository, metrics *ports.Metrics, logger *slog.Logger) *GPSHandler {
	return &GPSHandler{
		locationRepo: locationRepo,
		metrics:      metrics,
		logger:       logger,
	}
}

func (h *GPSHandler) Handle(msg mqtt.GPSMessage) error {
	h.metrics.GPSMessagesTotal.Inc()

	h.logger.Info("Mensaje GPS recibido",
		"bus_id", msg.BusID,
		"lat", msg.Latitude,
		"lng", msg.Longitude,
	)

	location := domain.Location{
		Latitude:  msg.Latitude,
		Longitude: msg.Longitude,
		Speed:     msg.Speed,
		Heading:   msg.Heading,
		Accuracy:  msg.Accuracy,
		Timestamp: msg.Timestamp,
	}

	if err := h.locationRepo.SavePosition(context.Background(), msg.BusID, location); err != nil {
		h.metrics.GPSMessagesErrors.Inc()
		h.logger.Error("Error al guardar posición GPS", "error", err)
		return err
	}

	h.logger.Debug("Posición GPS persistida", "bus_id", msg.BusID)
	return nil
}

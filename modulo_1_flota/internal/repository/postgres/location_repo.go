package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"time"

	"github.com/zenda/modulo_1_flota/internal/domain"
)

// LocationRepository implementa domain.LocationRepository
type LocationRepository struct {
	db     *sql.DB
	logger *slog.Logger
}

// NewLocationRepository crea una nueva instancia del repositorio de ubicaciones
func NewLocationRepository(db *sql.DB, logger *slog.Logger) *LocationRepository {
	return &LocationRepository{
		db:     db,
		logger: logger,
	}
}

// SavePosition guarda una posición GPS en la base de datos
func (r *LocationRepository) SavePosition(ctx context.Context, busID string, location domain.Location) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("contexto cancelado antes de guardar posición: %w", err)
	}

	if !location.IsValid() {
		return fmt.Errorf("coordenadas inválidas: lat=%f, lng=%f", location.Latitude, location.Longitude)
	}

	query := `
		INSERT INTO gps_logs (bus_id, latitude, longitude, speed, heading, accuracy, timestamp, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(ctx, query,
		busID,
		location.Latitude,
		location.Longitude,
		location.Speed,
		location.Heading,
		location.Accuracy,
		location.Timestamp,
		time.Now().UTC(),
	)
	if err != nil {
		r.logger.Error("Error al guardar posición GPS",
			"bus_id", busID,
			"lat", location.Latitude,
			"lng", location.Longitude,
			"error", err,
		)
		return fmt.Errorf("error al guardar posición GPS: %w", err)
	}

	r.logger.Debug("Posición GPS guardada", "bus_id", busID)
	return nil
}

// GetLastPosition obtiene la última posición registrada de un bus
func (r *LocationRepository) GetLastPosition(ctx context.Context, busID string) (*domain.Location, error) {
	if err := ctx.Err(); err != nil {
		return nil, fmt.Errorf("contexto cancelado antes de obtener última posición: %w", err)
	}

	query := `
		SELECT latitude, longitude, speed, heading, accuracy, timestamp
		FROM gps_logs
		WHERE bus_id = $1
		ORDER BY timestamp DESC
		LIMIT 1
	`

	var loc domain.Location
	err := r.db.QueryRowContext(ctx, query, busID).Scan(
		&loc.Latitude,
		&loc.Longitude,
		&loc.Speed,
		&loc.Heading,
		&loc.Accuracy,
		&loc.Timestamp,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error al obtener última posición: %w", err)
	}

	return &loc, nil
}

// GetHistory obtiene el historial de posiciones de un bus
func (r *LocationRepository) GetHistory(ctx context.Context, busID string, limit int) ([]domain.Location, error) {
	if err := ctx.Err(); err != nil {
		return nil, fmt.Errorf("contexto cancelado antes de obtener historial: %w", err)
	}

	if limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000
	}

	query := `
		SELECT latitude, longitude, speed, heading, accuracy, timestamp
		FROM gps_logs
		WHERE bus_id = $1
		ORDER BY timestamp DESC
		LIMIT $2
	`

	rows, err := r.db.QueryContext(ctx, query, busID, limit)
	if err != nil {
		return nil, fmt.Errorf("error al obtener historial de posiciones: %w", err)
	}
	defer rows.Close()

	var locations []domain.Location
	for rows.Next() {
		var loc domain.Location
		if err := rows.Scan(
			&loc.Latitude,
			&loc.Longitude,
			&loc.Speed,
			&loc.Heading,
			&loc.Accuracy,
			&loc.Timestamp,
		); err != nil {
			return nil, fmt.Errorf("error al escanear fila: %w", err)
		}
		locations = append(locations, loc)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error al iterar filas: %w", err)
	}

	return locations, nil
}

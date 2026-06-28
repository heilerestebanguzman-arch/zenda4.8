package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/zenda/modulo_1_flota/internal/domain"
)

type BusRepository struct {
	db     *sql.DB
	logger *slog.Logger
}

func NewBusRepository(db *sql.DB, logger *slog.Logger) *BusRepository {
	return &BusRepository{
		db:     db,
		logger: logger,
	}
}

// Save guarda un nuevo bus
func (r *BusRepository) Save(ctx context.Context, bus *domain.Bus) error {
	// Validar contexto antes de ejecutar la consulta
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("contexto cancelado antes de guardar bus: %w", err)
	}

	query := `
		INSERT INTO buses (id, plate, model, year, capacity, status, route_id, driver_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		bus.ID, bus.Plate, bus.Model, bus.Year, bus.Capacity,
		bus.Status, bus.RouteID, bus.DriverID, bus.CreatedAt, bus.UpdatedAt,
	)
	if err != nil {
		r.logger.Error("Error al guardar bus", "plate", bus.Plate, "error", err)
		return fmt.Errorf("error al guardar bus: %w", err)
	}
	return nil
}

// FindByID busca un bus por su ID
func (r *BusRepository) FindByID(ctx context.Context, id string) (*domain.Bus, error) {
	if err := ctx.Err(); err != nil {
		return nil, fmt.Errorf("contexto cancelado antes de buscar bus: %w", err)
	}

	query := `
		SELECT id, plate, model, year, capacity, status, route_id, driver_id, created_at, updated_at
		FROM buses WHERE id = $1
	`
	var bus domain.Bus
	var routeID, driverID sql.NullString

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&bus.ID, &bus.Plate, &bus.Model, &bus.Year, &bus.Capacity,
		&bus.Status, &routeID, &driverID, &bus.CreatedAt, &bus.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error al buscar bus por ID: %w", err)
	}

	if routeID.Valid {
		bus.RouteID = &routeID.String
	}
	if driverID.Valid {
		bus.DriverID = &driverID.String
	}
	return &bus, nil
}

// Update actualiza un bus existente
func (r *BusRepository) Update(ctx context.Context, bus *domain.Bus) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("contexto cancelado antes de actualizar bus: %w", err)
	}

	query := `
		UPDATE buses SET plate=$1, model=$2, year=$3, capacity=$4, status=$5,
		route_id=$6, driver_id=$7, updated_at=$8 WHERE id=$9
	`
	_, err := r.db.ExecContext(ctx, query,
		bus.Plate, bus.Model, bus.Year, bus.Capacity,
		bus.Status, bus.RouteID, bus.DriverID, bus.UpdatedAt, bus.ID,
	)
	if err != nil {
		r.logger.Error("Error al actualizar bus", "id", bus.ID, "error", err)
		return fmt.Errorf("error al actualizar bus: %w", err)
	}
	return nil
}

// Delete elimina un bus por su ID
func (r *BusRepository) Delete(ctx context.Context, id string) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("contexto cancelado antes de eliminar bus: %w", err)
	}

	query := `DELETE FROM buses WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		r.logger.Error("Error al eliminar bus", "id", id, "error", err)
		return fmt.Errorf("error al eliminar bus: %w", err)
	}
	return nil
}

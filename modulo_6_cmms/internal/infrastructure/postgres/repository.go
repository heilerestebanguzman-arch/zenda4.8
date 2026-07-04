package postgres

import (
    "context"
    "database/sql"
    "fmt"

    "github.com/google/uuid"
    _ "github.com/lib/pq"
    "modulo_6_cmms/internal/domain"
)

type PostgresRepository struct {
    db *sql.DB
}

func NewPostgresRepository(connStr string) (*PostgresRepository, error) {
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, err
    }
    if err := db.Ping(); err != nil {
        return nil, err
    }
    return &PostgresRepository{db: db}, nil
}

// Ping verifica la conexión a la base de datos
func (r *PostgresRepository) Ping() error {
    return r.db.Ping()
}

// ============================================
// VehicleRepository
// ============================================
func (r *PostgresRepository) Create(ctx context.Context, v *domain.Vehicle) error {
    _, err := r.db.ExecContext(ctx,
        `INSERT INTO cmms_vehicles (id, bus_id, brand, model, year, plate, mileage, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        v.ID, v.BusID, v.Brand, v.Model, v.Year, v.Plate, v.Mileage, v.Status)
    return err
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Vehicle, error) {
    var v domain.Vehicle
    err := r.db.QueryRowContext(ctx,
        `SELECT id, bus_id, brand, model, year, plate, mileage, status, created_at, updated_at
         FROM cmms_vehicles WHERE id = $1`, id).
        Scan(&v.ID, &v.BusID, &v.Brand, &v.Model, &v.Year, &v.Plate, &v.Mileage, &v.Status, &v.CreatedAt, &v.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return &v, nil
}

func (r *PostgresRepository) GetByBusID(ctx context.Context, busID string) (*domain.Vehicle, error) {
    var v domain.Vehicle
    err := r.db.QueryRowContext(ctx,
        `SELECT id, bus_id, brand, model, year, plate, mileage, status, created_at, updated_at
         FROM cmms_vehicles WHERE bus_id = $1`, busID).
        Scan(&v.ID, &v.BusID, &v.Brand, &v.Model, &v.Year, &v.Plate, &v.Mileage, &v.Status, &v.CreatedAt, &v.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return &v, nil
}

func (r *PostgresRepository) List(ctx context.Context) ([]domain.Vehicle, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, bus_id, brand, model, year, plate, mileage, status, created_at, updated_at
         FROM cmms_vehicles ORDER BY created_at DESC`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var vehicles []domain.Vehicle
    for rows.Next() {
        var v domain.Vehicle
        if err := rows.Scan(&v.ID, &v.BusID, &v.Brand, &v.Model, &v.Year, &v.Plate, &v.Mileage, &v.Status, &v.CreatedAt, &v.UpdatedAt); err != nil {
            return nil, err
        }
        vehicles = append(vehicles, v)
    }
    return vehicles, nil
}

func (r *PostgresRepository) Update(ctx context.Context, v *domain.Vehicle) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE cmms_vehicles SET brand=$1, model=$2, year=$3, plate=$4, mileage=$5, status=$6, updated_at=NOW()
         WHERE id=$7`,
        v.Brand, v.Model, v.Year, v.Plate, v.Mileage, v.Status, v.ID)
    return err
}

// ============================================
// scanOrder — reutilizable, maneja NULLs
// ============================================
func scanOrder(row interface {
    Scan(...interface{}) error
}) (*domain.MaintenanceOrder, error) {
    var o domain.MaintenanceOrder
    var actualCost, estimatedCost sql.NullFloat64
    err := row.Scan(
        &o.ID, &o.OrderNumber, &o.VehicleID, &o.Type, &o.Priority,
        &o.Title, &o.Description, &o.Status,
        &o.ScheduledDate, &o.CompletedDate,
        &estimatedCost, &actualCost,
        &o.Technician, &o.Notes, &o.CreatedBy,
        &o.CreatedAt, &o.UpdatedAt,
    )
    if err != nil {
        return nil, err
    }
    if estimatedCost.Valid {
        o.EstimatedCost = estimatedCost.Float64
    }
    if actualCost.Valid {
        o.ActualCost = actualCost.Float64
    }
    return &o, nil
}

// ============================================
// MaintenanceOrderRepository
// ============================================
func (r *PostgresRepository) CreateOrder(ctx context.Context, order *domain.MaintenanceOrder, parts []domain.OrderPart) error {
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    _, err = tx.ExecContext(ctx,
        `INSERT INTO cmms_orders (id, order_number, vehicle_id, type, priority, title, description,
         status, scheduled_date, estimated_cost, technician, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        order.ID, order.OrderNumber, order.VehicleID, order.Type, order.Priority,
        order.Title, order.Description, order.Status, order.ScheduledDate,
        order.EstimatedCost, order.Technician, order.Notes, order.CreatedBy)
    if err != nil {
        return err
    }

    for _, p := range parts {
        _, err = tx.ExecContext(ctx,
            `INSERT INTO cmms_order_parts (order_id, part_id, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
            order.ID, p.PartID, p.Quantity, p.UnitPrice)
        if err != nil {
            return err
        }
    }
    return tx.Commit()
}

func (r *PostgresRepository) GetOrderByID(ctx context.Context, id uuid.UUID) (*domain.MaintenanceOrder, error) {
    row := r.db.QueryRowContext(ctx,
        `SELECT id, order_number, vehicle_id, type, priority, title, description, status,
         scheduled_date, completed_date, estimated_cost, actual_cost, technician, notes,
         created_by, created_at, updated_at FROM cmms_orders WHERE id = $1`, id)
    return scanOrder(row)
}

func (r *PostgresRepository) ListOrders(ctx context.Context, status domain.OrderStatus, priority domain.OrderPriority) ([]domain.MaintenanceOrder, error) {
    query := `SELECT id, order_number, vehicle_id, type, priority, title, description, status,
              scheduled_date, completed_date, estimated_cost, actual_cost, technician, notes,
              created_by, created_at, updated_at FROM cmms_orders`
    args := []interface{}{}
    conditions := []string{}

    if status != "" {
        conditions = append(conditions, fmt.Sprintf("status = $%d", len(args)+1))
        args = append(args, status)
    }
    if priority != "" {
        conditions = append(conditions, fmt.Sprintf("priority = $%d", len(args)+1))
        args = append(args, priority)
    }
    if len(conditions) > 0 {
        query += " WHERE " + conditions[0]
        for _, c := range conditions[1:] {
            query += " AND " + c
        }
    }
    query += " ORDER BY created_at DESC"

    rows, err := r.db.QueryContext(ctx, query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var orders []domain.MaintenanceOrder
    for rows.Next() {
        o, err := scanOrder(rows)
        if err != nil {
            return nil, err
        }
        orders = append(orders, *o)
    }
    return orders, nil
}

func (r *PostgresRepository) UpdateOrder(ctx context.Context, o *domain.MaintenanceOrder) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE cmms_orders SET status=$1, actual_cost=$2, completed_date=$3, notes=$4, updated_at=NOW()
         WHERE id=$5`,
        o.Status, o.ActualCost, o.CompletedDate, o.Notes, o.ID)
    return err
}

func (r *PostgresRepository) UpdateOrderStatus(ctx context.Context, id uuid.UUID, status domain.OrderStatus) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE cmms_orders SET status=$1, updated_at=NOW() WHERE id=$2`, status, id)
    return err
}

// ============================================
// PartRepository
// ============================================
func (r *PostgresRepository) CreatePart(ctx context.Context, p *domain.Part) error {
    _, err := r.db.ExecContext(ctx,
        `INSERT INTO cmms_parts (id, part_number, name, description, category, stock, min_stock, price, supplier)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        p.ID, p.PartNumber, p.Name, p.Description, p.Category, p.Stock, p.MinStock, p.Price, p.Supplier)
    return err
}

func (r *PostgresRepository) GetPartByID(ctx context.Context, id uuid.UUID) (*domain.Part, error) {
    var p domain.Part
    err := r.db.QueryRowContext(ctx,
        `SELECT id, part_number, name, description, category, stock, min_stock, price, supplier, created_at, updated_at
         FROM cmms_parts WHERE id = $1`, id).
        Scan(&p.ID, &p.PartNumber, &p.Name, &p.Description, &p.Category, &p.Stock, &p.MinStock, &p.Price, &p.Supplier, &p.CreatedAt, &p.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return &p, nil
}

func (r *PostgresRepository) GetPartByPartNumber(ctx context.Context, partNumber string) (*domain.Part, error) {
    var p domain.Part
    err := r.db.QueryRowContext(ctx,
        `SELECT id, part_number, name, description, category, stock, min_stock, price, supplier, created_at, updated_at
         FROM cmms_parts WHERE part_number = $1`, partNumber).
        Scan(&p.ID, &p.PartNumber, &p.Name, &p.Description, &p.Category, &p.Stock, &p.MinStock, &p.Price, &p.Supplier, &p.CreatedAt, &p.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return &p, nil
}

func (r *PostgresRepository) ListParts(ctx context.Context) ([]domain.Part, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, part_number, name, description, category, stock, min_stock, price, supplier, created_at, updated_at
         FROM cmms_parts ORDER BY name`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var parts []domain.Part
    for rows.Next() {
        var p domain.Part
        if err := rows.Scan(&p.ID, &p.PartNumber, &p.Name, &p.Description, &p.Category, &p.Stock, &p.MinStock, &p.Price, &p.Supplier, &p.CreatedAt, &p.UpdatedAt); err != nil {
            return nil, err
        }
        parts = append(parts, p)
    }
    return parts, nil
}

func (r *PostgresRepository) UpdateStock(ctx context.Context, id uuid.UUID, delta int) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE cmms_parts SET stock = stock + $1, updated_at = NOW() WHERE id = $2`, delta, id)
    return err
}

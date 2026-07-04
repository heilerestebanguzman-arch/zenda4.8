package postgres

import (
    "context"
    "database/sql"
    "time"

    "github.com/google/uuid"
    _ "github.com/lib/pq"
    "modulo_7_clearinghouse/internal/domain"
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

func (r *PostgresRepository) Ping() error {
    return r.db.Ping()
}

// ============================================
// OperatorRepository - TODOS los métodos
// ============================================
func (r *PostgresRepository) Create(ctx context.Context, op *domain.Operator) error {
    _, err := r.db.ExecContext(ctx,
        `INSERT INTO ch_operators (id, name, code, commission_rate, contact_email, contact_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        op.ID, op.Name, op.Code, op.CommissionRate, op.ContactEmail, op.ContactPhone, op.Status)
    return err
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Operator, error) {
    var op domain.Operator
    err := r.db.QueryRowContext(ctx,
        `SELECT id, name, code, commission_rate, contact_email, contact_phone, status, created_at, updated_at
         FROM ch_operators WHERE id = $1`, id).
        Scan(&op.ID, &op.Name, &op.Code, &op.CommissionRate, &op.ContactEmail, &op.ContactPhone,
            &op.Status, &op.CreatedAt, &op.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return &op, nil
}

func (r *PostgresRepository) GetByCode(ctx context.Context, code string) (*domain.Operator, error) {
    var op domain.Operator
    err := r.db.QueryRowContext(ctx,
        `SELECT id, name, code, commission_rate, contact_email, contact_phone, status, created_at, updated_at
         FROM ch_operators WHERE code = $1`, code).
        Scan(&op.ID, &op.Name, &op.Code, &op.CommissionRate, &op.ContactEmail, &op.ContactPhone,
            &op.Status, &op.CreatedAt, &op.UpdatedAt)
    if err != nil {
        return nil, err
    }
    return &op, nil
}

func (r *PostgresRepository) List(ctx context.Context) ([]domain.Operator, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, name, code, commission_rate, contact_email, contact_phone, status, created_at, updated_at
         FROM ch_operators ORDER BY name`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var operators []domain.Operator
    for rows.Next() {
        var op domain.Operator
        if err := rows.Scan(&op.ID, &op.Name, &op.Code, &op.CommissionRate, &op.ContactEmail,
            &op.ContactPhone, &op.Status, &op.CreatedAt, &op.UpdatedAt); err != nil {
            return nil, err
        }
        operators = append(operators, op)
    }
    return operators, nil
}

func (r *PostgresRepository) Update(ctx context.Context, op *domain.Operator) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE ch_operators SET name=$1, commission_rate=$2, contact_email=$3, contact_phone=$4, status=$5, updated_at=NOW()
         WHERE id=$6`,
        op.Name, op.CommissionRate, op.ContactEmail, op.ContactPhone, op.Status, op.ID)
    return err
}

// ============================================
// SettlementRepository - TODOS los métodos
// ============================================
func (r *PostgresRepository) CreateSettlement(ctx context.Context, s *domain.Settlement) error {
    _, err := r.db.ExecContext(ctx,
        `INSERT INTO ch_settlements (id, settlement_number, operator_id, period_start, period_end,
         total_rides, total_revenue, total_commission, net_amount, status, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        s.ID, s.SettlementNumber, s.OperatorID, s.PeriodStart, s.PeriodEnd,
        s.TotalRides, s.TotalRevenue, s.TotalCommission, s.NetAmount, s.Status, s.Notes, s.CreatedBy)
    return err
}

func (r *PostgresRepository) GetSettlementByID(ctx context.Context, id uuid.UUID) (*domain.Settlement, error) {
    var s domain.Settlement
    var paymentDate sql.NullTime
    err := r.db.QueryRowContext(ctx,
        `SELECT id, settlement_number, operator_id, period_start, period_end,
         total_rides, total_revenue, total_commission, net_amount, status, payment_date, notes, created_by, created_at, updated_at
         FROM ch_settlements WHERE id = $1`, id).
        Scan(&s.ID, &s.SettlementNumber, &s.OperatorID, &s.PeriodStart, &s.PeriodEnd,
            &s.TotalRides, &s.TotalRevenue, &s.TotalCommission, &s.NetAmount, &s.Status,
            &paymentDate, &s.Notes, &s.CreatedBy, &s.CreatedAt, &s.UpdatedAt)
    if err != nil {
        return nil, err
    }
    if paymentDate.Valid {
        s.PaymentDate = &paymentDate.Time
    }
    return &s, nil
}

func (r *PostgresRepository) GetSettlementByNumber(ctx context.Context, number string) (*domain.Settlement, error) {
    var s domain.Settlement
    var paymentDate sql.NullTime
    err := r.db.QueryRowContext(ctx,
        `SELECT id, settlement_number, operator_id, period_start, period_end,
         total_rides, total_revenue, total_commission, net_amount, status, payment_date, notes, created_by, created_at, updated_at
         FROM ch_settlements WHERE settlement_number = $1`, number).
        Scan(&s.ID, &s.SettlementNumber, &s.OperatorID, &s.PeriodStart, &s.PeriodEnd,
            &s.TotalRides, &s.TotalRevenue, &s.TotalCommission, &s.NetAmount, &s.Status,
            &paymentDate, &s.Notes, &s.CreatedBy, &s.CreatedAt, &s.UpdatedAt)
    if err != nil {
        return nil, err
    }
    if paymentDate.Valid {
        s.PaymentDate = &paymentDate.Time
    }
    return &s, nil
}

func (r *PostgresRepository) ListByOperator(ctx context.Context, operatorID uuid.UUID) ([]domain.Settlement, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, settlement_number, operator_id, period_start, period_end,
         total_rides, total_revenue, total_commission, net_amount, status, payment_date, notes, created_at, updated_at
         FROM ch_settlements WHERE operator_id = $1 ORDER BY created_at DESC`, operatorID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var settlements []domain.Settlement
    for rows.Next() {
        var s domain.Settlement
        var paymentDate sql.NullTime
        if err := rows.Scan(&s.ID, &s.SettlementNumber, &s.OperatorID, &s.PeriodStart, &s.PeriodEnd,
            &s.TotalRides, &s.TotalRevenue, &s.TotalCommission, &s.NetAmount, &s.Status,
            &paymentDate, &s.Notes, &s.CreatedAt, &s.UpdatedAt); err != nil {
            return nil, err
        }
        if paymentDate.Valid {
            s.PaymentDate = &paymentDate.Time
        }
        settlements = append(settlements, s)
    }
    return settlements, nil
}

func (r *PostgresRepository) ListByStatus(ctx context.Context, status domain.SettlementStatus) ([]domain.Settlement, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, settlement_number, operator_id, period_start, period_end,
         total_rides, total_revenue, total_commission, net_amount, status, payment_date, notes, created_at, updated_at
         FROM ch_settlements WHERE status = $1 ORDER BY created_at DESC`, status)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var settlements []domain.Settlement
    for rows.Next() {
        var s domain.Settlement
        var paymentDate sql.NullTime
        if err := rows.Scan(&s.ID, &s.SettlementNumber, &s.OperatorID, &s.PeriodStart, &s.PeriodEnd,
            &s.TotalRides, &s.TotalRevenue, &s.TotalCommission, &s.NetAmount, &s.Status,
            &paymentDate, &s.Notes, &s.CreatedAt, &s.UpdatedAt); err != nil {
            return nil, err
        }
        if paymentDate.Valid {
            s.PaymentDate = &paymentDate.Time
        }
        settlements = append(settlements, s)
    }
    return settlements, nil
}

func (r *PostgresRepository) ListByPeriod(ctx context.Context, start, end time.Time) ([]domain.Settlement, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, settlement_number, operator_id, period_start, period_end,
         total_rides, total_revenue, total_commission, net_amount, status, payment_date, notes, created_at, updated_at
         FROM ch_settlements WHERE period_start >= $1 AND period_end <= $2 ORDER BY created_at DESC`, start, end)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var settlements []domain.Settlement
    for rows.Next() {
        var s domain.Settlement
        var paymentDate sql.NullTime
        if err := rows.Scan(&s.ID, &s.SettlementNumber, &s.OperatorID, &s.PeriodStart, &s.PeriodEnd,
            &s.TotalRides, &s.TotalRevenue, &s.TotalCommission, &s.NetAmount, &s.Status,
            &paymentDate, &s.Notes, &s.CreatedAt, &s.UpdatedAt); err != nil {
            return nil, err
        }
        if paymentDate.Valid {
            s.PaymentDate = &paymentDate.Time
        }
        settlements = append(settlements, s)
    }
    return settlements, nil
}

func (r *PostgresRepository) UpdateSettlement(ctx context.Context, s *domain.Settlement) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE ch_settlements SET total_rides=$1, total_revenue=$2, total_commission=$3, net_amount=$4, status=$5, notes=$6, updated_at=NOW()
         WHERE id=$7`,
        s.TotalRides, s.TotalRevenue, s.TotalCommission, s.NetAmount, s.Status, s.Notes, s.ID)
    return err
}

func (r *PostgresRepository) UpdateSettlementStatus(ctx context.Context, id uuid.UUID, status domain.SettlementStatus) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE ch_settlements SET status=$1, updated_at=NOW() WHERE id=$2`, status, id)
    return err
}

// ============================================
// TransactionRepository - TODOS los métodos
// ============================================
func (r *PostgresRepository) CreateTransaction(ctx context.Context, t *domain.Transaction) error {
    _, err := r.db.ExecContext(ctx,
        `INSERT INTO ch_transactions (id, ride_id, operator_id, passenger_id, amount, commission, type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        t.ID, t.RideID, t.OperatorID, t.PassengerID, t.Amount, t.Commission, t.Type, t.Status)
    return err
}

func (r *PostgresRepository) CreateBatch(ctx context.Context, transactions []domain.Transaction) error {
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    for _, t := range transactions {
        _, err = tx.ExecContext(ctx,
            `INSERT INTO ch_transactions (id, ride_id, operator_id, passenger_id, amount, commission, type, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            t.ID, t.RideID, t.OperatorID, t.PassengerID, t.Amount, t.Commission, t.Type, t.Status)
        if err != nil {
            return err
        }
    }
    return tx.Commit()
}

func (r *PostgresRepository) GetBySettlement(ctx context.Context, settlementID uuid.UUID) ([]domain.Transaction, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, ride_id, operator_id, passenger_id, amount, commission, type, status, created_at
         FROM ch_transactions WHERE settlement_id = $1`, settlementID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var transactions []domain.Transaction
    for rows.Next() {
        var t domain.Transaction
        if err := rows.Scan(&t.ID, &t.RideID, &t.OperatorID, &t.PassengerID, &t.Amount,
            &t.Commission, &t.Type, &t.Status, &t.CreatedAt); err != nil {
            return nil, err
        }
        transactions = append(transactions, t)
    }
    return transactions, nil
}

func (r *PostgresRepository) GetByOperator(ctx context.Context, operatorID uuid.UUID) ([]domain.Transaction, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, ride_id, operator_id, passenger_id, amount, commission, type, status, created_at
         FROM ch_transactions WHERE operator_id = $1 ORDER BY created_at DESC`, operatorID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var transactions []domain.Transaction
    for rows.Next() {
        var t domain.Transaction
        if err := rows.Scan(&t.ID, &t.RideID, &t.OperatorID, &t.PassengerID, &t.Amount,
            &t.Commission, &t.Type, &t.Status, &t.CreatedAt); err != nil {
            return nil, err
        }
        transactions = append(transactions, t)
    }
    return transactions, nil
}

func (r *PostgresRepository) GetByRideID(ctx context.Context, rideID string) (*domain.Transaction, error) {
    var t domain.Transaction
    err := r.db.QueryRowContext(ctx,
        `SELECT id, ride_id, operator_id, passenger_id, amount, commission, type, status, created_at
         FROM ch_transactions WHERE ride_id = $1`, rideID).
        Scan(&t.ID, &t.RideID, &t.OperatorID, &t.PassengerID, &t.Amount,
            &t.Commission, &t.Type, &t.Status, &t.CreatedAt)
    if err != nil {
        return nil, err
    }
    return &t, nil
}

func (r *PostgresRepository) ListUnsettled(ctx context.Context) ([]domain.Transaction, error) {
    rows, err := r.db.QueryContext(ctx,
        `SELECT id, ride_id, operator_id, passenger_id, amount, commission, type, status, created_at
         FROM ch_transactions WHERE status = 'PENDING' AND settlement_id IS NULL`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var transactions []domain.Transaction
    for rows.Next() {
        var t domain.Transaction
        if err := rows.Scan(&t.ID, &t.RideID, &t.OperatorID, &t.PassengerID, &t.Amount,
            &t.Commission, &t.Type, &t.Status, &t.CreatedAt); err != nil {
            return nil, err
        }
        transactions = append(transactions, t)
    }
    return transactions, nil
}

func (r *PostgresRepository) UpdateSettlementTransactions(ctx context.Context, settlementID uuid.UUID, transactionIDs []uuid.UUID) error {
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }
    defer tx.Rollback()

    for _, id := range transactionIDs {
        _, err = tx.ExecContext(ctx,
            `UPDATE ch_transactions SET settlement_id = $1, status = 'SETTLED' WHERE id = $2`,
            settlementID, id)
        if err != nil {
            return err
        }
    }
    return tx.Commit()
}

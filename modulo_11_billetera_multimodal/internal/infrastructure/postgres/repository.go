package postgres

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	_ "github.com/lib/pq"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/domain"
)

type WalletRepository struct {
	db *sql.DB
}

func NewWalletRepository(db *sql.DB) *WalletRepository {
	return &WalletRepository{db: db}
}

func (r *WalletRepository) Create(ctx context.Context, wallet *domain.Wallet) error {
	query := `
		INSERT INTO wallets (id, user_id, balance, currency, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
	`
	_, err := r.db.ExecContext(ctx, query,
		wallet.ID,
		wallet.UserID,
		wallet.Balance,
		wallet.Currency,
		wallet.Status,
	)
	return err
}

func (r *WalletRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Wallet, error) {
	query := `
		SELECT id, user_id, balance, currency, status, created_at, updated_at
		FROM wallets WHERE id = $1
	`
	var wallet domain.Wallet
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&wallet.ID,
		&wallet.UserID,
		&wallet.Balance,
		&wallet.Currency,
		&wallet.Status,
		&wallet.CreatedAt,
		&wallet.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &wallet, err
}

func (r *WalletRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*domain.Wallet, error) {
	query := `
		SELECT id, user_id, balance, currency, status, created_at, updated_at
		FROM wallets WHERE user_id = $1
	`
	var wallet domain.Wallet
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&wallet.ID,
		&wallet.UserID,
		&wallet.Balance,
		&wallet.Currency,
		&wallet.Status,
		&wallet.CreatedAt,
		&wallet.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &wallet, err
}

func (r *WalletRepository) Update(ctx context.Context, wallet *domain.Wallet) error {
	query := `
		UPDATE wallets 
		SET balance = $1, currency = $2, status = $3, updated_at = NOW()
		WHERE id = $4
	`
	_, err := r.db.ExecContext(ctx, query,
		wallet.Balance,
		wallet.Currency,
		wallet.Status,
		wallet.ID,
	)
	return err
}

func (r *WalletRepository) UpdateBalance(ctx context.Context, id uuid.UUID, newBalance float64) error {
	query := `UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, newBalance, id)
	return err
}

type TransactionRepository struct {
	db *sql.DB
}

func NewTransactionRepository(db *sql.DB) *TransactionRepository {
	return &TransactionRepository{db: db}
}

func (r *TransactionRepository) Create(ctx context.Context, tx *domain.Transaction) error {
	query := `
		INSERT INTO transactions (id, wallet_id, type, amount, balance_before, balance_after, description, reference_id, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
	`
	_, err := r.db.ExecContext(ctx, query,
		tx.ID,
		tx.WalletID,
		tx.Type,
		tx.Amount,
		tx.BalanceBefore,
		tx.BalanceAfter,
		tx.Description,
		tx.ReferenceID,
		tx.Status,
	)
	return err
}

func (r *TransactionRepository) GetByWalletID(ctx context.Context, walletID uuid.UUID, limit, offset int) ([]domain.Transaction, error) {
	query := `
		SELECT id, wallet_id, type, amount, balance_before, balance_after, description, reference_id, status, created_at
		FROM transactions
		WHERE wallet_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, walletID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []domain.Transaction
	for rows.Next() {
		var tx domain.Transaction
		err := rows.Scan(
			&tx.ID,
			&tx.WalletID,
			&tx.Type,
			&tx.Amount,
			&tx.BalanceBefore,
			&tx.BalanceAfter,
			&tx.Description,
			&tx.ReferenceID,
			&tx.Status,
			&tx.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, tx)
	}
	return transactions, nil
}

func (r *TransactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Transaction, error) {
	query := `
		SELECT id, wallet_id, type, amount, balance_before, balance_after, description, reference_id, status, created_at
		FROM transactions WHERE id = $1
	`
	var tx domain.Transaction
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&tx.ID,
		&tx.WalletID,
		&tx.Type,
		&tx.Amount,
		&tx.BalanceBefore,
		&tx.BalanceAfter,
		&tx.Description,
		&tx.ReferenceID,
		&tx.Status,
		&tx.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &tx, err
}

type RechargeOrderRepository struct {
	db *sql.DB
}

func NewRechargeOrderRepository(db *sql.DB) *RechargeOrderRepository {
	return &RechargeOrderRepository{db: db}
}

func (r *RechargeOrderRepository) Create(ctx context.Context, order *domain.RechargeOrder) error {
	query := `
		INSERT INTO recharge_orders (id, wallet_id, amount, payment_method, payment_reference, status, paid_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
	`
	_, err := r.db.ExecContext(ctx, query,
		order.ID,
		order.WalletID,
		order.Amount,
		order.PaymentMethod,
		order.PaymentReference,
		order.Status,
		order.PaidAt,
	)
	return err
}

func (r *RechargeOrderRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.RechargeOrder, error) {
	query := `
		SELECT id, wallet_id, amount, payment_method, payment_reference, status, paid_at, created_at, updated_at
		FROM recharge_orders WHERE id = $1
	`
	var order domain.RechargeOrder
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&order.ID,
		&order.WalletID,
		&order.Amount,
		&order.PaymentMethod,
		&order.PaymentReference,
		&order.Status,
		&order.PaidAt,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &order, err
}

func (r *RechargeOrderRepository) Update(ctx context.Context, order *domain.RechargeOrder) error {
	query := `
		UPDATE recharge_orders 
		SET status = $1, paid_at = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.db.ExecContext(ctx, query,
		order.Status,
		order.PaidAt,
		order.ID,
	)
	return err
}

func (r *RechargeOrderRepository) GetByWalletID(ctx context.Context, walletID uuid.UUID) ([]domain.RechargeOrder, error) {
	query := `
		SELECT id, wallet_id, amount, payment_method, payment_reference, status, paid_at, created_at, updated_at
		FROM recharge_orders
		WHERE wallet_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, walletID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []domain.RechargeOrder
	for rows.Next() {
		var order domain.RechargeOrder
		err := rows.Scan(
			&order.ID,
			&order.WalletID,
			&order.Amount,
			&order.PaymentMethod,
			&order.PaymentReference,
			&order.Status,
			&order.PaidAt,
			&order.CreatedAt,
			&order.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, nil
}

package usecases

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/domain"
)

type PaymentInput struct {
	WalletID    string  `json:"wallet_id"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

type PaymentOutput struct {
	TransactionID string  `json:"transaction_id"`
	WalletID      string  `json:"wallet_id"`
	Amount        float64 `json:"amount"`
	BalanceAfter  float64 `json:"balance_after"`
	Description   string  `json:"description"`
	Status        string  `json:"status"`
}

type PaymentUseCase struct {
	walletRepo      domain.WalletRepository
	transactionRepo domain.TransactionRepository
	eventPub        interface {
		PublishWalletPayment(walletID, transactionID string, amount float64, description string) error
	}
}

func NewPaymentUseCase(
	walletRepo domain.WalletRepository,
	transactionRepo domain.TransactionRepository,
	eventPub interface {
		PublishWalletPayment(walletID, transactionID string, amount float64, description string) error
	},
) *PaymentUseCase {
	return &PaymentUseCase{
		walletRepo:      walletRepo,
		transactionRepo: transactionRepo,
		eventPub:        eventPub,
	}
}

func (uc *PaymentUseCase) Execute(ctx context.Context, input PaymentInput) (*PaymentOutput, error) {
	walletID, err := uuid.Parse(input.WalletID)
	if err != nil {
		return nil, errors.New("invalid wallet_id format")
	}

	if input.Amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}

	wallet, err := uc.walletRepo.GetByID(ctx, walletID)
	if err != nil {
		return nil, fmt.Errorf("error getting wallet: %w", err)
	}
	if wallet == nil {
		return nil, errors.New("wallet not found")
	}

	if wallet.Status != string(domain.WalletStatusActive) {
		return nil, errors.New("wallet is not active")
	}

	if wallet.Balance < input.Amount {
		return nil, errors.New("insufficient balance")
	}

	oldBalance := wallet.Balance
	newBalance := oldBalance - input.Amount

	// Actualizar saldo
	if err := uc.walletRepo.UpdateBalance(ctx, walletID, newBalance); err != nil {
		return nil, fmt.Errorf("error updating wallet balance: %w", err)
	}

	// Crear transacción
	transaction := &domain.Transaction{
		ID:            uuid.New(),
		WalletID:      walletID,
		Type:          string(domain.TransactionTypePayment),
		Amount:        input.Amount,
		BalanceBefore: oldBalance,
		BalanceAfter:  newBalance,
		Description:   input.Description,
		Status:        string(domain.TransactionStatusCompleted),
	}

	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return nil, fmt.Errorf("error creating transaction: %w", err)
	}

	// Publicar evento
	if err := uc.eventPub.PublishWalletPayment(
		walletID.String(),
		transaction.ID.String(),
		input.Amount,
		input.Description,
	); err != nil {
		fmt.Printf("Error publishing event: %v\n", err)
	}

	return &PaymentOutput{
		TransactionID: transaction.ID.String(),
		WalletID:      walletID.String(),
		Amount:        input.Amount,
		BalanceAfter:  newBalance,
		Description:   input.Description,
		Status:        transaction.Status,
	}, nil
}

package usecases

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/domain"
)

type RechargeInput struct {
	WalletID         string  `json:"wallet_id"`
	Amount           float64 `json:"amount"`
	PaymentMethod    string  `json:"payment_method"`
	PaymentReference string  `json:"payment_reference"`
}

type RechargeOutput struct {
	OrderID          string  `json:"order_id"`
	WalletID         string  `json:"wallet_id"`
	Amount           float64 `json:"amount"`
	PaymentMethod    string  `json:"payment_method"`
	PaymentReference string  `json:"payment_reference"`
	Status           string  `json:"status"`
}

type RechargeUseCase struct {
	walletRepo    domain.WalletRepository
	orderRepo     domain.RechargeOrderRepository
	transactionRepo domain.TransactionRepository
	eventPub      interface {
		PublishWalletRecharged(walletID, transactionID string, amount float64) error
	}
}

func NewRechargeUseCase(
	walletRepo domain.WalletRepository,
	orderRepo domain.RechargeOrderRepository,
	transactionRepo domain.TransactionRepository,
	eventPub interface {
		PublishWalletRecharged(walletID, transactionID string, amount float64) error
	},
) *RechargeUseCase {
	return &RechargeUseCase{
		walletRepo:      walletRepo,
		orderRepo:       orderRepo,
		transactionRepo: transactionRepo,
		eventPub:        eventPub,
	}
}

func (uc *RechargeUseCase) Execute(ctx context.Context, input RechargeInput) (*RechargeOutput, error) {
	walletID, err := uuid.Parse(input.WalletID)
	if err != nil {
		return nil, errors.New("invalid wallet_id format")
	}

	if input.Amount <= 0 {
		return nil, errors.New("amount must be greater than 0")
	}

	// Validar método de pago
	validMethods := map[string]bool{
		string(domain.PaymentMethodCreditCard): true,
		string(domain.PaymentMethodDebit):      true,
		string(domain.PaymentMethodQR):         true,
		string(domain.PaymentMethodCash):       true,
	}
	if !validMethods[input.PaymentMethod] {
		return nil, errors.New("invalid payment method")
	}

	// Obtener wallet
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

	// Crear orden de recarga
	order := &domain.RechargeOrder{
		ID:               uuid.New(),
		WalletID:         walletID,
		Amount:           input.Amount,
		PaymentMethod:    input.PaymentMethod,
		PaymentReference: input.PaymentReference,
		Status:           string(domain.RechargeStatusPending),
	}

	if err := uc.orderRepo.Create(ctx, order); err != nil {
		return nil, fmt.Errorf("error creating recharge order: %w", err)
	}

	// (Simulación: en un sistema real, aquí se procesaría el pago)
	// Por ahora, marcamos como PAID automáticamente para simplificar
	now := time.Now()
	order.Status = string(domain.RechargeStatusPaid)
	order.PaidAt = &now

	if err := uc.orderRepo.Update(ctx, order); err != nil {
		return nil, fmt.Errorf("error updating recharge order: %w", err)
	}

	// Actualizar saldo de la wallet
	oldBalance := wallet.Balance
	newBalance := oldBalance + input.Amount

	if err := uc.walletRepo.UpdateBalance(ctx, walletID, newBalance); err != nil {
		return nil, fmt.Errorf("error updating wallet balance: %w", err)
	}

	// Crear transacción
	transaction := &domain.Transaction{
		ID:            uuid.New(),
		WalletID:      walletID,
		Type:          string(domain.TransactionTypeRecharge),
		Amount:        input.Amount,
		BalanceBefore: oldBalance,
		BalanceAfter:  newBalance,
		Description:   fmt.Sprintf("Recharge of %.2f via %s", input.Amount, input.PaymentMethod),
		ReferenceID:   &order.ID,
		Status:        string(domain.TransactionStatusCompleted),
	}

	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return nil, fmt.Errorf("error creating transaction: %w", err)
	}

	// Publicar evento
	if err := uc.eventPub.PublishWalletRecharged(
		walletID.String(),
		transaction.ID.String(),
		input.Amount,
	); err != nil {
		fmt.Printf("Error publishing event: %v\n", err)
	}

	return &RechargeOutput{
		OrderID:          order.ID.String(),
		WalletID:         walletID.String(),
		Amount:           input.Amount,
		PaymentMethod:    input.PaymentMethod,
		PaymentReference: input.PaymentReference,
		Status:           order.Status,
	}, nil
}

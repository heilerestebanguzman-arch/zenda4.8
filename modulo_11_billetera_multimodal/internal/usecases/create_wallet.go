package usecases

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/domain"
)

type CreateWalletInput struct {
	UserID   string
	Currency string
}

type CreateWalletOutput struct {
	WalletID string  `json:"wallet_id"`
	UserID   string  `json:"user_id"`
	Balance  float64 `json:"balance"`
	Currency string  `json:"currency"`
	Status   string  `json:"status"`
}

type CreateWalletUseCase struct {
	walletRepo domain.WalletRepository
	eventPub   interface {
		PublishWalletCreated(walletID, userID string, balance float64) error
	}
}

func NewCreateWalletUseCase(
	walletRepo domain.WalletRepository,
	eventPub interface {
		PublishWalletCreated(walletID, userID string, balance float64) error
	},
) *CreateWalletUseCase {
	return &CreateWalletUseCase{
		walletRepo: walletRepo,
		eventPub:   eventPub,
	}
}

func (uc *CreateWalletUseCase) Execute(ctx context.Context, input CreateWalletInput) (*CreateWalletOutput, error) {
	userID, err := uuid.Parse(input.UserID)
	if err != nil {
		return nil, errors.New("invalid user_id format")
	}

	// Verificar si el usuario ya tiene una billetera
	existing, err := uc.walletRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("error checking existing wallet: %w", err)
	}
	if existing != nil {
		return nil, errors.New("user already has a wallet")
	}

	currency := input.Currency
	if currency == "" {
		currency = string(domain.CurrencyBOB)
	}

	wallet := &domain.Wallet{
		ID:       uuid.New(),
		UserID:   userID,
		Balance:  0,
		Currency: currency,
		Status:   string(domain.WalletStatusActive),
	}

	if err := uc.walletRepo.Create(ctx, wallet); err != nil {
		return nil, fmt.Errorf("error creating wallet: %w", err)
	}

	// Publicar evento
	if err := uc.eventPub.PublishWalletCreated(
		wallet.ID.String(),
		wallet.UserID.String(),
		wallet.Balance,
	); err != nil {
		// Log pero no fallar la operación
		fmt.Printf("Error publishing event: %v\n", err)
	}

	return &CreateWalletOutput{
		WalletID: wallet.ID.String(),
		UserID:   wallet.UserID.String(),
		Balance:  wallet.Balance,
		Currency: wallet.Currency,
		Status:   wallet.Status,
	}, nil
}

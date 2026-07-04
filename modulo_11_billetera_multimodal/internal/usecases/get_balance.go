package usecases

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/domain"
)

type GetBalanceInput struct {
	WalletID string
}

type GetBalanceOutput struct {
	WalletID string  `json:"wallet_id"`
	UserID   string  `json:"user_id"`
	Balance  float64 `json:"balance"`
	Currency string  `json:"currency"`
	Status   string  `json:"status"`
}

type GetBalanceUseCase struct {
	walletRepo domain.WalletRepository
}

func NewGetBalanceUseCase(walletRepo domain.WalletRepository) *GetBalanceUseCase {
	return &GetBalanceUseCase{walletRepo: walletRepo}
}

func (uc *GetBalanceUseCase) Execute(ctx context.Context, input GetBalanceInput) (*GetBalanceOutput, error) {
	walletID, err := uuid.Parse(input.WalletID)
	if err != nil {
		return nil, errors.New("invalid wallet_id format")
	}

	wallet, err := uc.walletRepo.GetByID(ctx, walletID)
	if err != nil {
		return nil, fmt.Errorf("error getting wallet: %w", err)
	}
	if wallet == nil {
		return nil, errors.New("wallet not found")
	}

	return &GetBalanceOutput{
		WalletID: wallet.ID.String(),
		UserID:   wallet.UserID.String(),
		Balance:  wallet.Balance,
		Currency: wallet.Currency,
		Status:   wallet.Status,
	}, nil
}

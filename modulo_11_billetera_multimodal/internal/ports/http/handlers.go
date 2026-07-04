package http

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/usecases"
)

type WalletHandler struct {
	createWalletUC *usecases.CreateWalletUseCase
	getBalanceUC   *usecases.GetBalanceUseCase
	rechargeUC     *usecases.RechargeUseCase
	paymentUC      *usecases.PaymentUseCase
}

func NewWalletHandler(
	createWalletUC *usecases.CreateWalletUseCase,
	getBalanceUC *usecases.GetBalanceUseCase,
	rechargeUC *usecases.RechargeUseCase,
	paymentUC *usecases.PaymentUseCase,
) *WalletHandler {
	return &WalletHandler{
		createWalletUC: createWalletUC,
		getBalanceUC:   getBalanceUC,
		rechargeUC:     rechargeUC,
		paymentUC:      paymentUC,
	}
}

func (h *WalletHandler) CreateWallet(c *gin.Context) {
	var req struct {
		UserID   string `json:"user_id" binding:"required"`
		Currency string `json:"currency"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := usecases.CreateWalletInput{
		UserID:   req.UserID,
		Currency: req.Currency,
	}

	output, err := h.createWalletUC.Execute(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, output)
}

func (h *WalletHandler) GetBalance(c *gin.Context) {
	walletID := c.Param("id")
	if walletID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet_id is required"})
		return
	}

	input := usecases.GetBalanceInput{WalletID: walletID}
	output, err := h.getBalanceUC.Execute(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, output)
}

func (h *WalletHandler) Recharge(c *gin.Context) {
	walletID := c.Param("id")
	if walletID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet_id is required"})
		return
	}

	var req struct {
		Amount           float64 `json:"amount" binding:"required"`
		PaymentMethod    string  `json:"payment_method" binding:"required"`
		PaymentReference string  `json:"payment_reference"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := usecases.RechargeInput{
		WalletID:         walletID,
		Amount:           req.Amount,
		PaymentMethod:    req.PaymentMethod,
		PaymentReference: req.PaymentReference,
	}

	output, err := h.rechargeUC.Execute(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, output)
}

func (h *WalletHandler) Payment(c *gin.Context) {
	walletID := c.Param("id")
	if walletID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet_id is required"})
		return
	}

	var req struct {
		Amount      float64 `json:"amount" binding:"required"`
		Description string  `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := usecases.PaymentInput{
		WalletID:    walletID,
		Amount:      req.Amount,
		Description: req.Description,
	}

	output, err := h.paymentUC.Execute(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, output)
}

func (h *WalletHandler) GetTransactions(c *gin.Context) {
	walletID := c.Param("id")
	if walletID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "wallet_id is required"})
		return
	}

	// TODO: Implementar con un use case específico
	c.JSON(http.StatusOK, gin.H{
		"message":   "Get transactions endpoint",
		"wallet_id": walletID,
		"status":    "not yet fully implemented",
	})
}

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/nats-io/nats.go"

	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/infrastructure/postgres"
	nats_publisher "github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/infrastructure/nats"
	wallethttp "github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/ports/http"
	"github.com/heilerestebanguzman-arch/zenda4.8/modulo_11_billetera_multimodal/internal/usecases"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Configuración
	port := os.Getenv("PORT")
	if port == "" {
		port = "8092"
	}

	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	if dbHost == "" || dbUser == "" || dbPassword == "" || dbName == "" {
		log.Fatal("Missing database environment variables")
	}

	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = nats.DefaultURL
	}

	// Conectar a PostgreSQL
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
	log.Println("✅ Connected to PostgreSQL")

	// Conectar a NATS
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatalf("Error connecting to NATS: %v", err)
	}
	defer nc.Close()
	log.Println("✅ Connected to NATS")

	// Inicializar repositorios
	walletRepo := postgres.NewWalletRepository(db)
	transactionRepo := postgres.NewTransactionRepository(db)
	rechargeOrderRepo := postgres.NewRechargeOrderRepository(db)

	// Inicializar publicador de eventos
	eventPublisher := nats_publisher.NewEventPublisher(nc)

	// Inicializar casos de uso
	createWalletUC := usecases.NewCreateWalletUseCase(walletRepo, eventPublisher)
	getBalanceUC := usecases.NewGetBalanceUseCase(walletRepo)
	rechargeUC := usecases.NewRechargeUseCase(walletRepo, rechargeOrderRepo, transactionRepo, eventPublisher)
	paymentUC := usecases.NewPaymentUseCase(walletRepo, transactionRepo, eventPublisher)

	// Inicializar handlers
	walletHandler := wallethttp.NewWalletHandler(
		createWalletUC,
		getBalanceUC,
		rechargeUC,
		paymentUC,
	)

	// Configurar router
	router := gin.Default()

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "modulo_11_billetera_multimodal",
			"port":    port,
		})
	})

	// Rutas de la API
	api := router.Group("/api/v1")
	{
		api.POST("/wallets", walletHandler.CreateWallet)
		api.GET("/wallets/:id/balance", walletHandler.GetBalance)
		api.POST("/wallets/:id/recharge", walletHandler.Recharge)
		api.POST("/wallets/:id/payment", walletHandler.Payment)
		api.GET("/wallets/:id/transactions", walletHandler.GetTransactions)
	}

	// Iniciar servidor
	log.Printf("🚀 Server running on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

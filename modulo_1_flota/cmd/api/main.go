package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/zenda/modulo_1_flota/internal/infrastructure/auth"
	"github.com/zenda/modulo_1_flota/internal/infrastructure/mqtt"
	httpports "github.com/zenda/modulo_1_flota/internal/ports/http"
	mqttports "github.com/zenda/modulo_1_flota/internal/ports/mqtt"
	"github.com/zenda/modulo_1_flota/internal/ports"
	"github.com/zenda/modulo_1_flota/internal/repository/postgres"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	metrics := ports.NewMetrics()
	tokenValidator := auth.NewTokenValidator()
	authMiddleware := auth.AuthMiddleware(tokenValidator)

	dbCfg := postgres.Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     5432,
		User:     getEnv("DB_USER", "zenda_admin"),
		Password: getEnv("DB_PASSWORD", "zenda_secure_pass_2026"),
		DBName:   getEnv("DB_NAME", "zenda"),
		SSLMode:  "disable",
	}

	db, err := postgres.NewConnection(dbCfg, logger)
	if err != nil {
		logger.Error("Error al conectar a PostgreSQL", "error", err)
		os.Exit(1)
	}
	defer postgres.Close(db, logger)

	busRepo := postgres.NewBusRepository(db, logger)
	locationRepo := postgres.NewLocationRepository(db, logger)

	// HTTP Handlers
	busHandler := httpports.NewBusHandler(busRepo, metrics)
	gpsHandler := mqttports.NewGPSHandler(locationRepo, metrics, logger)

	// MQTT
	mqttBroker := getEnv("MQTT_BROKER", "tcp://localhost:1883")
	mqttClient := mqtt.NewClient(mqttBroker, logger, gpsHandler.Handle)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := mqttClient.Connect(ctx); err != nil {
		logger.Error("Error al conectar a MQTT", "error", err)
		os.Exit(1)
	}
	defer mqttClient.Disconnect()

	if err := mqttClient.Subscribe("/gps/bus/+/position"); err != nil {
		logger.Error("Error al suscribirse a MQTT", "error", err)
		os.Exit(1)
	}

	// HTTP Routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Módulo 1 - Flota OK"))
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	http.Handle("/metrics", promhttp.Handler())

	// Ruta protegida con autenticación
	http.Handle("/api/v1/buses", authMiddleware(busHandler.CreateBus))

	port := getEnv("PORT", "8081")
	server := &http.Server{
		Addr:         ":" + port,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		logger.Info("Servidor HTTP corriendo", "port", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("Error en servidor HTTP", "error", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Apagando servidor...")

	ctxShutdown, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()

	if err := server.Shutdown(ctxShutdown); err != nil {
		logger.Error("Error al apagar servidor", "error", err)
	}

	logger.Info("Servidor apagado correctamente")
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

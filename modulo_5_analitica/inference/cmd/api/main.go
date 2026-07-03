package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"modulo_5_analitica/inference/internal/infrastructure/redis"
	httpports "modulo_5_analitica/inference/internal/ports/http"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	port      := getEnv("PORT", "8086")
	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnv("REDIS_PORT", "6379")
	redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)

	redisClient := redis.NewRedisClient(redisAddr, "", 0)
	if err := redisClient.Ping(); err != nil {
		log.Fatalf("❌ Error conectando a Redis: %v", err)
	}
	log.Println("✅ Conectado a Redis")

	handlers := httpports.NewHandlers(redisClient)

	r := mux.NewRouter()
	r.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
	r.HandleFunc("/api/v1/predict/eta", handlers.CalculateETA).Methods("POST")
	r.HandleFunc("/api/v1/predict/factors/{bus_id}", handlers.GetETAFactors).Methods("GET")
	r.HandleFunc("/api/v1/predict/eta/{bus_id}", handlers.GetPrediction).Methods("GET")

	log.Printf("🚀 Módulo 5 - Analítica corriendo en puerto %s", port)
	log.Printf("📊 Health check: http://localhost:%s/health", port)

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("❌ Error iniciando servidor: %v", err)
	}
}

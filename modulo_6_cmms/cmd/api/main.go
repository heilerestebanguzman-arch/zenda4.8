package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
	"github.com/nats-io/nats.go"

	natssub "modulo_6_cmms/internal/infrastructure/nats"
)

func main() {
	// Configuración
	port := os.Getenv("PORT")
	if port == "" {
		port = "8087"
	}

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "zenda_admin"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "zenda_secure_pass_2026"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "zenda"
	}

	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}

	// Conectar a PostgreSQL
	connStr := "host=" + dbHost + " port=" + dbPort + " user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Error connecting to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Error pinging database: %v", err)
	}
	log.Println("✅ Connected to PostgreSQL")

	// Conectar a NATS
	nc, err := nats.Connect(natsURL)
	if err != nil {
		log.Fatalf("❌ Error connecting to NATS: %v", err)
	}
	defer nc.Close()
	log.Println("✅ Connected to NATS")

	// Suscribirse a order.created
	if err := natssub.SubscribeToOrders(nc); err != nil {
		log.Fatalf("❌ Error subscribing to orders: %v", err)
	}

	// Health check
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "ok",
			"service": "modulo_6_cmms",
		})
	})

	log.Printf("🚀 Módulo 6 - CMMS corriendo en puerto %s", port)
	log.Printf("📊 Health check: http://localhost:%s/health", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("❌ Error starting server: %v", err)
	}
}

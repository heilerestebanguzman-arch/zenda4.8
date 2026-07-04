package main

import (
    "log"
    "net/http"
    "os"

    "github.com/gorilla/mux"
    "modulo_7_clearinghouse/internal/infrastructure/postgres"
    "modulo_7_clearinghouse/internal/ports/http/handlers"
    "modulo_7_clearinghouse/internal/usecases"
)

func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}

func main() {
    port := getEnv("PORT", "8090")
    connStr := getEnv("DATABASE_URL", "postgresql://zenda_admin:zenda_secure_pass_2026@localhost:5432/zenda?sslmode=disable")

    repo, err := postgres.NewPostgresRepository(connStr)
    if err != nil {
        log.Fatalf("❌ Error conectando a PostgreSQL: %v", err)
    }
    log.Println("✅ Conectado a PostgreSQL")

    createSettlementUC := usecases.NewCreateSettlementUseCase(repo)
    listSettlementsUC := usecases.NewListSettlementsUseCase(repo)

    h := handlers.NewHandlers(createSettlementUC, listSettlementsUC, repo.Ping)

    r := mux.NewRouter()
    r.HandleFunc("/health", h.HealthCheck).Methods("GET")
    r.HandleFunc("/api/v1/settlements", h.CreateSettlement).Methods("POST")
    r.HandleFunc("/api/v1/settlements", h.ListSettlements).Methods("GET")
    r.HandleFunc("/api/v1/settlements/operator/{operator_id}", h.ListSettlements).Methods("GET")

    log.Printf("🚀 Módulo 7 - Clearinghouse corriendo en puerto %s", port)
    log.Printf("📊 Health check: http://localhost:%s/health", port)

    if err := http.ListenAndServe(":"+port, r); err != nil {
        log.Fatalf("❌ Error iniciando servidor: %v", err)
    }
}

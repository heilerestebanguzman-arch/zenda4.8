package main

import (
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/google/uuid"
    "github.com/gorilla/mux"
    "modulo_6_cmms/internal/domain"
    "modulo_6_cmms/internal/infrastructure/nats"
    "modulo_6_cmms/internal/infrastructure/postgres"
    "modulo_6_cmms/internal/ports/http/handlers"
    "modulo_6_cmms/internal/usecases"
)

func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}

func main() {
    port := getEnv("PORT", "8087")
    connStr := getEnv("DATABASE_URL", "postgresql://zenda_admin:zenda_secure_pass_2026@localhost:5432/zenda?sslmode=disable")
    natsURL := getEnv("NATS_URL", "nats://nats:4222")

    repo, err := postgres.NewPostgresRepository(connStr)
    if err != nil {
        log.Fatalf("❌ Error conectando a PostgreSQL: %v", err)
    }
    log.Println("✅ Conectado a PostgreSQL")

    var eventPub *nats.EventPublisher
    eventPub, err = nats.NewEventPublisher(natsURL)
    if err != nil {
        log.Printf("⚠️ Error conectando a NATS: %v (continuando sin eventos)", err)
        eventPub = nil
    } else {
        log.Println("✅ Conectado a NATS")
        defer eventPub.Close()
    }

    createOrderUC := usecases.NewCreateOrderUseCase(repo, repo, repo, eventPub)
    listOrdersUC := usecases.NewListOrdersUseCase(repo)
    updateOrderUC := usecases.NewUpdateOrderUseCase(repo)

    h := handlers.NewHandlers(createOrderUC, listOrdersUC, updateOrderUC, repo.Ping)

    r := mux.NewRouter()

    r.HandleFunc("/health", h.HealthCheck).Methods("GET")

    // 🔓 MODO PRUEBA - SIN AUTENTICACIÓN
    r.HandleFunc("/api/v1/vehicles", func(w http.ResponseWriter, req *http.Request) {
        var input struct {
            BusID   string `json:"bus_id"`
            Brand   string `json:"brand"`
            Model   string `json:"model"`
            Year    int    `json:"year"`
            Plate   string `json:"plate"`
            Mileage int    `json:"mileage"`
        }
        if err := json.NewDecoder(req.Body).Decode(&input); err != nil {
            http.Error(w, "Invalid body", http.StatusBadRequest)
            return
        }
        v := &domain.Vehicle{
            ID:        uuid.New(),
            BusID:     input.BusID,
            Brand:     input.Brand,
            Model:     input.Model,
            Year:      input.Year,
            Plate:     input.Plate,
            Mileage:   input.Mileage,
            Status:    domain.VehicleActive,
            CreatedAt: time.Now(),
            UpdatedAt: time.Now(),
        }
        if err := repo.Create(req.Context(), v); err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(map[string]interface{}{"status": "ok", "vehicle": v})
    }).Methods("POST")

    r.HandleFunc("/api/v1/vehicles", func(w http.ResponseWriter, req *http.Request) {
        vehicles, err := repo.List(req.Context())
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{"status": "ok", "vehicles": vehicles})
    }).Methods("GET")

    r.HandleFunc("/api/v1/orders", h.CreateOrder).Methods("POST")
    r.HandleFunc("/api/v1/orders", h.ListOrders).Methods("GET")
    r.HandleFunc("/api/v1/orders/{id}", h.UpdateOrder).Methods("PUT")

    log.Printf("🚀 Módulo 6 - CMMS (MODO PRUEBA - SIN JWT) corriendo en puerto %s", port)
    log.Printf("📊 Health check: http://localhost:%s/health", port)
    if eventPub != nil {
        log.Printf("📨 Eventos NATS activados")
    }

    if err := http.ListenAndServe(":"+port, r); err != nil {
        log.Fatalf("❌ Error iniciando servidor: %v", err)
    }
}

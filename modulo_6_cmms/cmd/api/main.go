package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/nats-io/nats.go"
    "modulo_6_cmms/internal/handlers"
    "modulo_6_cmms/internal/services"
)

func main() {
    log.SetFlags(log.LstdFlags | log.Lshortfile)

    // Conectar a NATS
    natsURL := os.Getenv("NATS_URL")
    if natsURL == "" {
        natsURL = "nats://localhost:4222"
    }

    nc, err := nats.Connect(natsURL)
    if err != nil {
        log.Fatalf("Failed to connect to NATS: %v", err)
    }
    defer nc.Close()

    // Crear servicios
    orderService := services.NewOrderService(nc)
    orderHandler := handlers.NewOrderHandler(orderService)

    // Configurar router
    router := gin.Default()

    // Rutas
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":   "ok",
            "service":  "M6-CMMS",
            "timestamp": time.Now().UTC().Format(time.RFC3339),
        })
    })

    // Ruta para crear órdenes
    router.POST("/api/v1/orders", orderHandler.CreateOrder)

    // Suscripción a eventos NATS
    go func() {
        _, err := nc.Subscribe("order.created", func(msg *nats.Msg) {
            log.Printf("📩 Evento recibido: %s", msg.Subject)
        })
        if err != nil {
            log.Printf("Error suscribiendo a order.created: %v", err)
        }
    }()

    // Configurar servidor HTTP (sin TLS para desarrollo)
    server := &http.Server{
        Addr:    ":8087",
        Handler: router,
    }

    // Iniciar servidor
    go func() {
        log.Printf("🚀 Servidor M6 (CMMS) corriendo en http://localhost:8087")
        log.Printf("📝 Health: http://localhost:8087/health")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Error iniciando servidor: %v", err)
        }
    }()

    // Esperar señal de terminación
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server exited properly")
}

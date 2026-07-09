package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/gin-gonic/gin"
    "github.com/nats-io/nats.go"
    "github.com/zenda/modulo_6_cmms/internal/config"
    "github.com/zenda/modulo_6_cmms/internal/handlers"
    "github.com/zenda/modulo_6_cmms/internal/services"
)

func main() {
    // Configurar logging
    log.SetFlags(log.LstdFlags | log.Lshortfile)

    // Conectar a NATS
    nc, err := nats.Connect(os.Getenv("NATS_URL"))
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
            "status": "ok",
            "service": "M6-CMMS",
            "timestamp": time.Now().UTC().Format(time.RFC3339),
        })
    })

    // Suscribirse a eventos
    go func() {
        _, err := nc.Subscribe("order.created", func(msg *nats.Msg) {
            log.Printf("📩 Evento recibido: %s", msg.Subject)
            // Procesar evento
        })
        if err != nil {
            log.Printf("Error suscribiendo a order.created: %v", err)
        }
    }()

    // Cargar configuración TLS
    tlsConfig, err := config.LoadTLSConfig()
    if err != nil {
        log.Fatalf("Failed to load TLS config: %v", err)
    }

    // Configurar servidor HTTPS
    server := &http.Server{
        Addr:      ":8087",
        Handler:   router,
        TLSConfig: tlsConfig,
    }

    // Iniciar servidor en goroutine
    go func() {
        log.Printf("🔒 Servidor M6 (CMMS) corriendo en https://localhost:8087")
        log.Printf("📝 Health: https://localhost:8087/health")
        if err := server.ListenAndServeTLS("certs/server.crt", "certs/server.key"); err != nil && err != http.ErrServerClosed {
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

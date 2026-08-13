package main

import (
    "database/sql"
    "log"
    "net/http"
    "time"
    _ "github.com/lib/pq"
    "github.com/gin-gonic/gin"
)

func main() {
    // Conectar a PostgreSQL (central)
    connStr := "host=localhost port=5432 user=zenda_admin password=zenda_secure_pass_2026 dbname=zenda sslmode=disable"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("❌ Error conectando a PostgreSQL:", err)
    }
    defer db.Close()

    if err := db.Ping(); err != nil {
        log.Fatal("❌ Error haciendo ping a PostgreSQL:", err)
    }
    log.Println("✅ Conectado a PostgreSQL exitosamente (M18.1)")

    router := gin.Default()

    // Health Check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":  "OK",
            "service": "modulo_18_1_edge_validator",
        })
    })

    // ============================================
    // ENDPOINTS DE SINCRONIZACIÓN OFFLINE
    // ============================================

    // POST /api/v1/edge/sync - Sincronizar transacciones offline
    router.POST("/api/v1/edge/sync", func(c *gin.Context) {
        var transactions []map[string]interface{}
        if err := c.ShouldBindJSON(&transactions); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "success": false,
                "error":   "Datos inválidos",
            })
            return
        }

        // Simular sincronización
        syncCount := len(transactions)
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "synced_count": syncCount,
                "timestamp":    time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // GET /api/v1/edge/blacklist - Obtener lista negra local
    router.GET("/api/v1/edge/blacklist", func(c *gin.Context) {
        blacklist := []map[string]interface{}{
            {
                "user_id":    "user-123",
                "reason":     "Fraude detectado",
                "expires_at": "2026-12-31T23:59:59Z",
            },
        }
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data":    blacklist,
        })
    })

    // POST /api/v1/edge/validate - Validar pago offline
    router.POST("/api/v1/edge/validate", func(c *gin.Context) {
        var body struct {
            UserID    string  `json:"user_id"`
            Amount    float64 `json:"amount"`
            BusID     string  `json:"bus_id"`
            Timestamp int64   `json:"timestamp"`
            Signature string  `json:"signature"`
        }

        if err := c.ShouldBindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "success": false,
                "error":   "Datos inválidos",
            })
            return
        }

        // Simular validación
        // Aquí iría la verificación de firma y saldo local
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "transaction_id": "txn_" + time.Now().Format("20060102150405"),
                "status":         "approved",
                "timestamp":      time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    port := "8099"
    log.Printf("🔒 M18.1 - Edge Validator corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Sync: http://localhost:%s/api/v1/edge/sync", port)
    log.Printf("📝 Validate: http://localhost:%s/api/v1/edge/validate", port)
    router.Run(":" + port)
}
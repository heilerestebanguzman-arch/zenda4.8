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
    // Conectar a PostgreSQL
    connStr := "host=localhost port=5432 user=zenda_admin password=zenda_secure_pass_2026 dbname=zenda sslmode=disable"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("❌ Error conectando a PostgreSQL:", err)
    }
    defer db.Close()

    if err := db.Ping(); err != nil {
        log.Fatal("❌ Error haciendo ping a PostgreSQL:", err)
    }
    log.Println("✅ Conectado a PostgreSQL exitosamente (M7.1)")

    router := gin.Default()

    // Health Check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":  "OK",
            "service": "modulo_7_1_cash_reconciliation",
        })
    })

    // POST /api/v1/clearing/cash/report - Reportar efectivo
    router.POST("/api/v1/clearing/cash/report", func(c *gin.Context) {
        var body struct {
            DriverID        string  `json:"driver_id"`
            BusID           string  `json:"bus_id"`
            ShiftID         string  `json:"shift_id"`
            DeclaredAmount  float64 `json:"declared_amount"`
        }
        if err := c.ShouldBindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "success": false,
                "error":   "Datos inválidos",
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "declaration_id": "dec_" + time.Now().Format("20060102150405"),
                "driver_id":      body.DriverID,
                "declared_amount": body.DeclaredAmount,
                "status":         "pending",
                "timestamp":      time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // GET /api/v1/clearing/cash/reconcile/{shift_id} - Conciliar turno
    router.GET("/api/v1/clearing/cash/reconcile/:shift_id", func(c *gin.Context) {
        shiftID := c.Param("shift_id")
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "shift_id":         shiftID,
                "declared_amount":  150.00,
                "estimated_amount": 142.50,
                "discrepancy":      7.50,
                "status":           "reconciled",
            },
        })
    })

    // GET /api/v1/clearing/cash/summary - Resumen diario
    router.GET("/api/v1/clearing/cash/summary", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "total_declared":   1250.00,
                "total_estimated":  1180.00,
                "total_discrepancy": 70.00,
                "reconciled_count": 12,
                "pending_count":    3,
                "date":             time.Now().Format("2006-01-02"),
            },
        })
    })

    port := "8102"
    log.Printf("💰 M7.1 - Cash Reconciliation corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Report: http://localhost:%s/api/v1/clearing/cash/report", port)
    log.Printf("📝 Reconcile: http://localhost:%s/api/v1/clearing/cash/reconcile/{shift_id}", port)
    log.Printf("📝 Summary: http://localhost:%s/api/v1/clearing/cash/summary", port)
    router.Run(":" + port)
}

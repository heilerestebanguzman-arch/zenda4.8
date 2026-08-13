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
    log.Println("✅ Conectado a PostgreSQL exitosamente (M18)")

    router := gin.Default()

    // Health Check
    router.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status":  "OK",
            "service": "modulo_18_iot_sensores",
        })
    })

    // ============================================
    // ENDPOINTS DE SENSORES
    // ============================================

    // POST /api/v1/iot/bus/:busId/location - Recibir ubicación GPS
    router.POST("/api/v1/iot/bus/:busId/location", func(c *gin.Context) {
        busId := c.Param("busId")
        var body struct {
            Latitude  float64 `json:"latitude"`
            Longitude float64 `json:"longitude"`
            Speed     float64 `json:"speed"`
            Heading   int     `json:"heading"`
        }
        if err := c.ShouldBindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "success": false,
                "error":   "Datos inválidos",
            })
            return
        }

        // Registrar ubicación en PostgreSQL
        _, err := db.Exec(`
            INSERT INTO tenant_default.bus_locations (bus_id, latitude, longitude, speed, heading)
            VALUES ($1, $2, $3, $4, $5)
        `, busId, body.Latitude, body.Longitude, body.Speed, body.Heading)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "success": false,
                "error":   err.Error(),
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "bus_id":    busId,
                "latitude":  body.Latitude,
                "longitude": body.Longitude,
                "speed":     body.Speed,
                "heading":   body.Heading,
                "timestamp": time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // POST /api/v1/iot/bus/:busId/sensors - Recibir datos de sensores
    router.POST("/api/v1/iot/bus/:busId/sensors", func(c *gin.Context) {
        busId := c.Param("busId")
        var body struct {
            DoorsOpen   bool `json:"doors_open"`
            PassengerCount int `json:"passenger_count"`
            Temperature float64 `json:"temperature"`
        }
        if err := c.ShouldBindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "success": false,
                "error":   "Datos inválidos",
            })
            return
        }

        // Actualizar estado del bus
        _, err := db.Exec(`
            UPDATE tenant_default.vehicles 
            SET status = $1 
            WHERE id = $2
        `, func() string {
            if body.DoorsOpen {
                return "stopped"
            }
            return "in_transit"
        }(), busId)
        if err != nil {
            log.Println("⚠️ No se pudo actualizar estado del bus:", err)
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "bus_id":          busId,
                "doors_open":      body.DoorsOpen,
                "passenger_count": body.PassengerCount,
                "temperature":     body.Temperature,
                "timestamp":       time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // POST /api/v1/iot/bus/:busId/panic - Activar botón pánico
    router.POST("/api/v1/iot/bus/:busId/panic", func(c *gin.Context) {
        busId := c.Param("busId")
        var body struct {
            Reason string `json:"reason"`
        }
        if err := c.ShouldBindJSON(&body); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "success": false,
                "error":   "Datos inválidos",
            })
            return
        }

        // Registrar incidente en PostgreSQL
        _, err := db.Exec(`
            INSERT INTO tenant_default.transport_incidents 
            (bus_id, type, severity, description) 
            VALUES ($1, $2, $3, $4)
        `, busId, "panic", "critical", body.Reason)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "success": false,
                "error":   err.Error(),
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "bus_id":    busId,
                "reason":    body.Reason,
                "alert_sent": true,
                "timestamp": time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // GET /api/v1/iot/bus/:busId/status - Estado del bus
    router.GET("/api/v1/iot/bus/:busId/status", func(c *gin.Context) {
        busId := c.Param("busId")
        
        var status string
        err := db.QueryRow(`
            SELECT status FROM tenant_default.vehicles WHERE id = $1
        `, busId).Scan(&status)
        if err != nil {
            c.JSON(http.StatusNotFound, gin.H{
                "success": false,
                "error": "Bus no encontrado",
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "bus_id": busId,
                "status": status,
                "timestamp": time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // GET /api/v1/iot/location/:busId - Última ubicación del bus
    router.GET("/api/v1/iot/location/:busId", func(c *gin.Context) {
        busId := c.Param("busId")
        
        var latitude, longitude, speed float64
        var heading int
        var timestamp time.Time
        
        err := db.QueryRow(`
            SELECT latitude, longitude, speed, heading, time
            FROM tenant_default.bus_locations 
            WHERE bus_id = $1 
            ORDER BY time DESC 
            LIMIT 1
        `, busId).Scan(&latitude, &longitude, &speed, &heading, &timestamp)
        
        if err != nil {
            c.JSON(http.StatusNotFound, gin.H{
                "success": false,
                "error": "Ubicación no encontrada",
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data": gin.H{
                "bus_id":    busId,
                "latitude":  latitude,
                "longitude": longitude,
                "speed":     speed,
                "heading":   heading,
                "timestamp": timestamp.Format(time.RFC3339),
            },
        })
    })

    port := "8098"
    log.Printf("📡 M18 - IoT Sensores corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Location: http://localhost:%s/api/v1/iot/bus/{busId}/location", port)
    log.Printf("📝 Sensors: http://localhost:%s/api/v1/iot/bus/{busId}/sensors", port)
    log.Printf("📝 Panic: http://localhost:%s/api/v1/iot/bus/{busId}/panic", port)
    log.Printf("📝 Status: http://localhost:%s/api/v1/iot/bus/{busId}/status", port)
    router.Run(":" + port)
}

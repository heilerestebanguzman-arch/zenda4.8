package main

import (
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    _ "github.com/lib/pq"
)

type Vehicle struct {
    ID       string `json:"id"`
    Plate    string `json:"plate"`
    Brand    string `json:"brand"`
    Model    string `json:"model"`
    Year     int    `json:"year"`
    Color    string `json:"color"`
    Status   string `json:"status"`
    Type     string `json:"type"`
    Capacity int    `json:"capacity"`
    Mileage  int    `json:"mileage"`
}

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
    log.Println("✅ Conectado a PostgreSQL exitosamente (M1 - Ampliado)")

    // ============================================
    // ENDPOINTS DE FLOTA AMPLIADA CON CORS
    // ============================================

    // GET /api/v1/vehicles - Listar vehículos (con filtros)
    http.HandleFunc("/api/v1/vehicles", func(w http.ResponseWriter, r *http.Request) {
        // CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        if r.Method == "GET" {
            vehicleType := r.URL.Query().Get("type")
            status := r.URL.Query().Get("status")

            query := `SELECT id, plate, brand, model, year, color, status, type, capacity, mileage FROM tenant_default.vehicles WHERE 1=1`
            args := []interface{}{}
            argCount := 1

            if vehicleType != "" {
                query += ` AND type = $` + string(rune('0'+argCount))
                args = append(args, vehicleType)
                argCount++
            }
            if status != "" {
                query += ` AND status = $` + string(rune('0'+argCount))
                args = append(args, status)
                argCount++
            }

            rows, err := db.Query(query, args...)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer rows.Close()

            var vehicles []Vehicle
            for rows.Next() {
                var v Vehicle
                err := rows.Scan(&v.ID, &v.Plate, &v.Brand, &v.Model, &v.Year, &v.Color, &v.Status, &v.Type, &v.Capacity, &v.Mileage)
                if err != nil {
                    http.Error(w, err.Error(), http.StatusInternalServerError)
                    return
                }
                vehicles = append(vehicles, v)
            }

            sendJSON(w, http.StatusOK, map[string]interface{}{
                "success": true,
                "data":    vehicles,
                "count":   len(vehicles),
            })
            return
        }

        if r.Method == "POST" {
            var v Vehicle
            if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
                sendError(w, "Datos inválidos", http.StatusBadRequest)
                return
            }

            if v.Plate == "" || v.Brand == "" || v.Model == "" {
                sendError(w, "Placa, marca y modelo son requeridos", http.StatusBadRequest)
                return
            }

            if v.Type == "" {
                v.Type = "BUS"
            }

            validTypes := map[string]bool{"MICRO": true, "MINIBUS": true, "BRT": true, "BUS": true, "TAXI": true}
            if !validTypes[v.Type] {
                sendError(w, "Tipo inválido. Permitidos: MICRO, MINIBUS, BRT, BUS", http.StatusBadRequest)
                return
            }

            var id string
            err := db.QueryRow(`
                INSERT INTO tenant_default.vehicles 
                (plate, brand, model, year, color, status, type, capacity, mileage) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING id
            `, v.Plate, v.Brand, v.Model, v.Year, v.Color, "available", v.Type, v.Capacity, 0).Scan(&id)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            v.ID = id
            sendJSON(w, http.StatusCreated, map[string]interface{}{
                "success": true,
                "data":    v,
            })
            return
        }

        sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
    })

    // GET /api/v1/vehicles/:id - Obtener vehículo por ID
    http.HandleFunc("/api/v1/vehicles/", func(w http.ResponseWriter, r *http.Request) {
        // CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        if r.Method == "GET" {
            id := r.URL.Path[len("/api/v1/vehicles/"):]
            var v Vehicle

            err := db.QueryRow(`
                SELECT id, plate, brand, model, year, color, status, type, capacity, mileage 
                FROM tenant_default.vehicles WHERE id = $1
            `, id).Scan(&v.ID, &v.Plate, &v.Brand, &v.Model, &v.Year, &v.Color, &v.Status, &v.Type, &v.Capacity, &v.Mileage)
            if err != nil {
                sendError(w, "Vehículo no encontrado", http.StatusNotFound)
                return
            }

            sendJSON(w, http.StatusOK, map[string]interface{}{
                "success": true,
                "data":    v,
            })
            return
        }

        if r.Method == "PUT" {
            id := r.URL.Path[len("/api/v1/vehicles/"):]
            var v Vehicle
            if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
                sendError(w, "Datos inválidos", http.StatusBadRequest)
                return
            }

            _, err := db.Exec(`
                UPDATE tenant_default.vehicles 
                SET plate = $1, brand = $2, model = $3, year = $4, color = $5, 
                    status = $6, type = $7, capacity = $8, mileage = $9
                WHERE id = $10
            `, v.Plate, v.Brand, v.Model, v.Year, v.Color, v.Status, v.Type, v.Capacity, v.Mileage, id)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            v.ID = id
            sendJSON(w, http.StatusOK, map[string]interface{}{
                "success": true,
                "data":    v,
            })
            return
        }

        if r.Method == "DELETE" {
            id := r.URL.Path[len("/api/v1/vehicles/"):]
            _, err := db.Exec("DELETE FROM tenant_default.vehicles WHERE id = $1", id)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            sendJSON(w, http.StatusOK, map[string]interface{}{
                "success": true,
                "message": "Vehículo eliminado correctamente",
            })
            return
        }

        sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
    })

    // GET /api/v1/vehicles/stats - Estadísticas de flota
    http.HandleFunc("/api/v1/vehicles/stats", func(w http.ResponseWriter, r *http.Request) {
        // CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        if r.Method != "GET" {
            sendError(w, "Método no permitido", http.StatusMethodNotAllowed)
            return
        }

        var stats struct {
            Total    int            `json:"total"`
            ByType   map[string]int `json:"by_type"`
            ByStatus map[string]int `json:"by_status"`
        }
        stats.ByType = make(map[string]int)
        stats.ByStatus = make(map[string]int)

        // Total
        db.QueryRow("SELECT COUNT(*) FROM tenant_default.vehicles").Scan(&stats.Total)

        // Por tipo
        rows, err := db.Query("SELECT type, COUNT(*) FROM tenant_default.vehicles GROUP BY type")
        if err == nil {
            defer rows.Close()
            for rows.Next() {
                var t string
                var c int
                rows.Scan(&t, &c)
                stats.ByType[t] = c
            }
        }

        // Por estado
        rows, err = db.Query("SELECT status, COUNT(*) FROM tenant_default.vehicles GROUP BY status")
        if err == nil {
            defer rows.Close()
            for rows.Next() {
                var s string
                var c int
                rows.Scan(&s, &c)
                stats.ByStatus[s] = c
            }
        }

        sendJSON(w, http.StatusOK, map[string]interface{}{
            "success": true,
            "data":    stats,
        })
    })

    // Health Check
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        // CORS
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }

        sendJSON(w, http.StatusOK, map[string]string{
            "status":  "OK",
            "service": "modulo_1_flota",
            "version": "ampliada-urban",
        })
    })

    port := "8081"
    log.Printf("🚌 M1 - Flota Ampliada corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Vehicles: http://localhost:%s/api/v1/vehicles", port)
    log.Printf("📝 Stats: http://localhost:%s/api/v1/vehicles/stats", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

func sendJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func sendError(w http.ResponseWriter, message string, status int) {
    sendJSON(w, status, map[string]interface{}{
        "success": false,
        "error":   message,
    })
}
package main

import (
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    _ "github.com/lib/pq"
)

func main() {
    connStr := "host=localhost port=5432 user=zenda_admin password=zenda_secure_pass_2026 dbname=zenda sslmode=disable"
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("❌ Error conectando a PostgreSQL:", err)
    }
    defer db.Close()

    if err := db.Ping(); err != nil {
        log.Fatal("❌ Error haciendo ping a PostgreSQL:", err)
    }
    log.Println("✅ Conectado a PostgreSQL exitosamente")

    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status":  "OK",
            "service": "modulo_1_flota",
        })
    })

    http.HandleFunc("/api/v1/vehicles", func(w http.ResponseWriter, r *http.Request) {
        if r.Method == "GET" {
            rows, err := db.Query("SELECT id, plate, brand, model, year, color, status, type, capacity, mileage FROM tenant_default.vehicles")
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer rows.Close()

            var vehicles []map[string]interface{}
            for rows.Next() {
                var id, plate, brand, model, color, status, vehicleType string
                var year, capacity, mileage int

                err := rows.Scan(&id, &plate, &brand, &model, &year, &color, &status, &vehicleType, &capacity, &mileage)
                if err != nil {
                    http.Error(w, err.Error(), http.StatusInternalServerError)
                    return
                }

                vehicles = append(vehicles, map[string]interface{}{
                    "id":       id,
                    "plate":    plate,
                    "brand":    brand,
                    "model":    model,
                    "year":     year,
                    "color":    color,
                    "status":   status,
                    "type":     vehicleType,
                    "capacity": capacity,
                    "mileage":  mileage,
                })
            }

            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": vehicles})
            return
        }

        if r.Method == "POST" {
            var body struct {
                Plate    string `json:"plate"`
                Brand    string `json:"brand"`
                Model    string `json:"model"`
                Year     int    `json:"year"`
                Color    string `json:"color"`
                Type     string `json:"type"`
                Capacity int    `json:"capacity"`
            }

            if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
                http.Error(w, "Datos inválidos", http.StatusBadRequest)
                return
            }

            query := `INSERT INTO tenant_default.vehicles (plate, brand, model, year, color, status, type, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`
            var id string
            err := db.QueryRow(query, body.Plate, body.Brand, body.Model, body.Year, body.Color, "available", body.Type, body.Capacity).Scan(&id)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": map[string]interface{}{"id": id, "plate": body.Plate, "brand": body.Brand, "model": body.Model, "year": body.Year, "color": body.Color, "status": "available", "type": body.Type, "capacity": body.Capacity}})
            return
        }
        http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
    })

    port := "8081"
    log.Printf("🚀 M1 - Flota corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Vehicles: http://localhost:%s/api/v1/vehicles", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

package main

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
    _ "github.com/lib/pq"
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
    log.Println("✅ Conectado a PostgreSQL exitosamente (M7)")

    // Health Check
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status":  "OK",
            "service": "modulo_7_clearinghouse",
        })
    })

    // ============================================
    // ENDPOINT DE CONCILIACIÓN (GET y POST unificados)
    // ============================================

    http.HandleFunc("/api/v1/clearing/reconcile", func(w http.ResponseWriter, r *http.Request) {
        if r.Method == "GET" {
            // GET - Obtener pagos pendientes de conciliación
            rows, err := db.Query(`
                SELECT id, order_id, amount, currency, status, method, description, 
                       reference, processed_at, created_at 
                FROM tenant_default.payments 
                WHERE status = 'completed' AND processed_at IS NOT NULL
                ORDER BY created_at DESC
            `)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer rows.Close()

            var payments []map[string]interface{}
            for rows.Next() {
                var id, orderId, currency, status, method, description, reference string
                var amount float64
                var processedAt, createdAt sql.NullTime

                err := rows.Scan(&id, &orderId, &amount, &currency, &status, &method, &description,
                    &reference, &processedAt, &createdAt)
                if err != nil {
                    http.Error(w, err.Error(), http.StatusInternalServerError)
                    return
                }

                payment := map[string]interface{}{
                    "id":          id,
                    "order_id":    orderId,
                    "amount":      amount,
                    "currency":    currency,
                    "status":      status,
                    "method":      method,
                    "description": description,
                    "reference":   reference,
                }
                if processedAt.Valid {
                    payment["processed_at"] = processedAt.Time
                }
                if createdAt.Valid {
                    payment["created_at"] = createdAt.Time
                }

                payments = append(payments, payment)
            }

            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(map[string]interface{}{
                "success": true,
                "data":    payments,
                "count":   len(payments),
            })
            return
        }

        if r.Method == "POST" {
            // POST - Realizar conciliación
            var body struct {
                PaymentIds []string `json:"payment_ids"`
            }

            if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
                http.Error(w, "Datos inválidos", http.StatusBadRequest)
                return
            }

            if len(body.PaymentIds) == 0 {
                http.Error(w, "Se requiere al menos un ID de pago", http.StatusBadRequest)
                return
            }

            tx, err := db.Begin()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer tx.Rollback()

            var reconciledCount int
            for _, id := range body.PaymentIds {
                result, err := tx.Exec(`
                    UPDATE tenant_default.payments 
                    SET status = 'cleared' 
                    WHERE id = $1 AND status = 'completed'
                `, id)
                if err != nil {
                    http.Error(w, err.Error(), http.StatusInternalServerError)
                    return
                }

                rows, _ := result.RowsAffected()
                if rows > 0 {
                    reconciledCount++
                }
            }

            _, err = tx.Exec(`
                INSERT INTO tenant_default.audit_logs (action, entity_type, entity_id, new_data) 
                VALUES ($1, $2, $3, $4)
            `, "clearing_reconcile", "payment", body.PaymentIds[0], 
                fmt.Sprintf(`{"reconciled_count": %d, "payment_ids": %v}`, reconciledCount, body.PaymentIds))
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            if err := tx.Commit(); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusOK)
            json.NewEncoder(w).Encode(map[string]interface{}{
                "success": true,
                "data": map[string]interface{}{
                    "reconciled_count": reconciledCount,
                    "total":            len(body.PaymentIds),
                    "timestamp":        time.Now().UTC().Format(time.RFC3339),
                },
            })
            return
        }

        http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
    })

    // ============================================
    // ENDPOINT DE ASENTAMIENTOS
    // ============================================

    http.HandleFunc("/api/v1/clearing/settlement", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
            http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
            return
        }

        rows, err := db.Query(`
            SELECT 
                DATE(created_at) as settlement_date,
                COUNT(*) as total_transactions,
                SUM(amount) as total_amount,
                currency
            FROM tenant_default.payments 
            WHERE status = 'cleared'
            GROUP BY DATE(created_at), currency
            ORDER BY settlement_date DESC
        `)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        defer rows.Close()

        var settlements []map[string]interface{}
        for rows.Next() {
            var settlementDate time.Time
            var totalTransactions int
            var totalAmount float64
            var currency string

            err := rows.Scan(&settlementDate, &totalTransactions, &totalAmount, &currency)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            settlements = append(settlements, map[string]interface{}{
                "settlement_date":    settlementDate.Format("2006-01-02"),
                "total_transactions": totalTransactions,
                "total_amount":       totalAmount,
                "currency":           currency,
            })
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "success": true,
            "data":    settlements,
        })
    })

    port := "8090"
    log.Printf("🏦 M7 - Clearinghouse corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Reconcile: http://localhost:%s/api/v1/clearing/reconcile", port)
    log.Printf("📝 Settlement: http://localhost:%s/api/v1/clearing/settlement", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
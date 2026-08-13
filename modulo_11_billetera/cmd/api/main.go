package main

import (
    "database/sql"
    "encoding/json"
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
    log.Println("✅ Conectado a PostgreSQL exitosamente (M11)")

    // Health Check
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status":  "OK",
            "service": "modulo_11_billetera",
        })
    })

    // ============================================
    // ENDPOINTS DE BILLETERA
    // ============================================

    // GET /api/v1/wallet/balance - Obtener saldo
    http.HandleFunc("/api/v1/wallet/balance", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != "GET" {
            http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
            return
        }

        userID := r.URL.Query().Get("user_id")
        if userID == "" {
            http.Error(w, "user_id es requerido", http.StatusBadRequest)
            return
        }

        var balance float64
        var currency string
        err := db.QueryRow(`
            SELECT COALESCE(SUM(amount), 0) as balance, 'USD' as currency
            FROM tenant_default.payments 
            WHERE status = 'cleared' AND order_id = $1
        `, userID).Scan(&balance, &currency)

        if err != nil && err != sql.ErrNoRows {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "success": true,
            "data": map[string]interface{}{
                "user_id":    userID,
                "balance":    balance,
                "currency":   currency,
                "updated_at": time.Now().UTC().Format(time.RFC3339),
            },
        })
    })

    // ============================================
    // ENDPOINT DE TRANSACCIONES (GET y POST unificados)
    // ============================================

    http.HandleFunc("/api/v1/wallet/transactions", func(w http.ResponseWriter, r *http.Request) {
        if r.Method == "GET" {
            // GET - Listar transacciones
            userID := r.URL.Query().Get("user_id")
            if userID == "" {
                http.Error(w, "user_id es requerido", http.StatusBadRequest)
                return
            }

            rows, err := db.Query(`
                SELECT id, amount, currency, status, description, reference, created_at
                FROM tenant_default.payments 
                WHERE order_id = $1 AND status IN ('completed', 'cleared')
                ORDER BY created_at DESC
                LIMIT 50
            `, userID)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer rows.Close()

            var transactions []map[string]interface{}
            for rows.Next() {
                var id, currency, status, description, reference string
                var amount float64
                var createdAt time.Time

                err := rows.Scan(&id, &amount, &currency, &status, &description, &reference, &createdAt)
                if err != nil {
                    http.Error(w, err.Error(), http.StatusInternalServerError)
                    return
                }

                transactions = append(transactions, map[string]interface{}{
                    "id":          id,
                    "amount":      amount,
                    "currency":    currency,
                    "status":      status,
                    "description": description,
                    "reference":   reference,
                    "created_at":  createdAt.Format(time.RFC3339),
                })
            }

            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(map[string]interface{}{
                "success": true,
                "data":    transactions,
                "count":   len(transactions),
            })
            return
        }

        if r.Method == "POST" {
            // POST - Registrar transacción
            var body struct {
                UserID    string  `json:"user_id"`
                Amount    float64 `json:"amount"`
                Type      string  `json:"type"`
                Reference string  `json:"reference"`
                Note      string  `json:"note"`
            }

            if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
                http.Error(w, "Datos inválidos", http.StatusBadRequest)
                return
            }

            if body.UserID == "" || body.Amount == 0 {
                http.Error(w, "user_id y amount son requeridos", http.StatusBadRequest)
                return
            }

            validTypes := map[string]bool{"credit": true, "debit": true}
            if !validTypes[body.Type] {
                http.Error(w, "Tipo inválido. Permitidos: credit, debit", http.StatusBadRequest)
                return
            }

            tx, err := db.Begin()
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer tx.Rollback()

            var transactionID string
            err = tx.QueryRow(`
                INSERT INTO tenant_default.payments 
                (order_id, amount, currency, status, method, description, reference) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING id
            `, body.UserID, body.Amount, "USD", "completed", "wallet", body.Note, body.Reference).Scan(&transactionID)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            if err := tx.Commit(); err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(map[string]interface{}{
                "success": true,
                "data": map[string]interface{}{
                    "transaction_id": transactionID,
                    "user_id":        body.UserID,
                    "amount":         body.Amount,
                    "type":           body.Type,
                    "status":         "completed",
                    "timestamp":      time.Now().UTC().Format(time.RFC3339),
                },
            })
            return
        }

        http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
    })

    port := "8092"
    log.Printf("💰 M11 - Billetera corriendo en puerto %s", port)
    log.Printf("📝 Health: http://localhost:%s/health", port)
    log.Printf("📝 Balance: http://localhost:%s/api/v1/wallet/balance?user_id={id}", port)
    log.Printf("📝 Transactions: http://localhost:%s/api/v1/wallet/transactions", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
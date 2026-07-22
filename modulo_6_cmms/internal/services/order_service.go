package services

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/go-redis/redis/v8"
)

var ctx = context.Background()

type OrderService struct {
    redisClient *redis.Client
}

func NewOrderService(redisClient *redis.Client) *OrderService {
    return &OrderService{
        redisClient: redisClient,
    }
}

func (s *OrderService) GetOrders(tenantID string) ([]interface{}, error) {
    cacheKey := fmt.Sprintf("orders:list:%s", tenantID)

    // 1. Verificar caché
    if s.redisClient != nil {
        cached, err := s.redisClient.Get(ctx, cacheKey).Result()
        if err == nil {
            var orders []interface{}
            if err := json.Unmarshal([]byte(cached), &orders); err == nil {
                log.Printf("✅ Cache hit: %s", cacheKey)
                return orders, nil
            }
        }
        log.Printf("⏳ Cache miss: %s", cacheKey)
    }

    // 2. Consultar base de datos
    log.Println("📊 Ejecutando consulta SQL para órdenes...")
    // Simular consulta a BD (reemplazar con lógica real)
    mockOrders := []interface{}{
        map[string]interface{}{
            "id":          "order-001",
            "description": "Mantenimiento preventivo",
            "status":      "COMPLETED",
            "tenant_id":   tenantID,
            "created_at":  time.Now().Format(time.RFC3339),
        },
        map[string]interface{}{
            "id":          "order-002",
            "description": "Cambio de aceite",
            "status":      "COMPLETED",
            "tenant_id":   tenantID,
            "created_at":  time.Now().Format(time.RFC3339),
        },
        map[string]interface{}{
            "id":          "order-003",
            "description": "Revisión de frenos",
            "status":      "COMPLETED",
            "tenant_id":   tenantID,
            "created_at":  time.Now().Format(time.RFC3339),
        },
    }

    // 3. Guardar en caché (TTL: 5 minutos)
    if s.redisClient != nil {
        data, err := json.Marshal(mockOrders)
        if err == nil {
            if err := s.redisClient.Set(ctx, cacheKey, data, 5*time.Minute).Err(); err != nil {
                log.Printf("⚠️ Error saving cache: %v", err)
            } else {
                log.Printf("✅ Cache saved: %s", cacheKey)
            }
        }
    }

    return mockOrders, nil
}

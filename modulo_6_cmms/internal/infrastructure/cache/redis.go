package cache

import (
    "context"
    "log"
    "os"

    "github.com/go-redis/redis/v8"
)

var ctx = context.Background()

func NewRedisClient() *redis.Client {
    redisURL := os.Getenv("REDIS_URL")
    if redisURL == "" {
        redisURL = "redis://localhost:6379"
    }

    opt, err := redis.ParseURL(redisURL)
    if err != nil {
        log.Printf("⚠️ Error parsing Redis URL: %v, usando localhost", err)
        opt = &redis.Options{
            Addr: "localhost:6379",
        }
    }

    client := redis.NewClient(opt)

    _, err = client.Ping(ctx).Result()
    if err != nil {
        log.Printf("⚠️ Error connecting to Redis: %v", err)
        return nil
    }

    log.Println("✅ Redis Client Connected (M6)")
    return client
}

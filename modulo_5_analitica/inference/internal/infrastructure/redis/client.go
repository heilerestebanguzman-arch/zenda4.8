package redis

import (
    "context"
    "encoding/json"
    "time"

    "github.com/go-redis/redis/v8"
    "modulo_5_analitica/inference/internal/domain"
)

type RedisClient struct {
    client *redis.Client
    ctx    context.Context
}

func NewRedisClient(addr, password string, db int) *RedisClient {
    client := redis.NewClient(&redis.Options{
        Addr:     addr,
        Password: password,
        DB:       db,
    })

    return &RedisClient{
        client: client,
        ctx:    context.Background(),
    }
}

func (r *RedisClient) SetETAFactors(busID string, factors *domain.ETAFactors) error {
    data, err := json.Marshal(factors)
    if err != nil {
        return err
    }

    return r.client.Set(r.ctx, "eta:factors:"+busID, data, 5*time.Minute).Err()
}

func (r *RedisClient) GetETAFactors(busID string) (*domain.ETAFactors, error) {
    data, err := r.client.Get(r.ctx, "eta:factors:"+busID).Result()
    if err != nil {
        return nil, err
    }

    var factors domain.ETAFactors
    if err := json.Unmarshal([]byte(data), &factors); err != nil {
        return nil, err
    }

    return &factors, nil
}

func (r *RedisClient) SetPrediction(busID string, prediction *domain.ETAPrediction) error {
    data, err := json.Marshal(prediction)
    if err != nil {
        return err
    }

    return r.client.Set(r.ctx, "eta:prediction:"+busID, data, 30*time.Second).Err()
}

func (r *RedisClient) GetPrediction(busID string) (*domain.ETAPrediction, error) {
    data, err := r.client.Get(r.ctx, "eta:prediction:"+busID).Result()
    if err != nil {
        return nil, err
    }

    var prediction domain.ETAPrediction
    if err := json.Unmarshal([]byte(data), &prediction); err != nil {
        return nil, err
    }

    return &prediction, nil
}

func (r *RedisClient) Ping() error {
    return r.client.Ping(r.ctx).Err()
}

package http

import (
    "encoding/json"
    "net/http"
    "time"

    "github.com/gorilla/mux"
    "modulo_5_analitica/inference/internal/domain"
    "modulo_5_analitica/inference/internal/eta"
    "modulo_5_analitica/inference/internal/infrastructure/redis"
)

type Handlers struct {
    redisClient   *redis.RedisClient
    factorCalc    *eta.FactorCalculator
    featureMapper *eta.FeatureMapper
}

func NewHandlers(redisClient *redis.RedisClient) *Handlers {
    return &Handlers{
        redisClient:   redisClient,
        factorCalc:    eta.NewFactorCalculator(),
        featureMapper: eta.NewFeatureMapper(),
    }
}

func (h *Handlers) HealthCheck(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status":  "ok",
        "service": "modulo_5_analitica_inference",
    })
}

func (h *Handlers) GetETAFactors(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    busID := vars["bus_id"]

    factors, err := h.redisClient.GetETAFactors(busID)
    if err != nil {
        w.WriteHeader(http.StatusNotFound)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "No se encontraron factores para el bus " + busID,
        })
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "ok",
        "data":   factors,
    })
}

func (h *Handlers) GetPrediction(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    busID := vars["bus_id"]

    prediction, err := h.redisClient.GetPrediction(busID)
    if err != nil {
        w.WriteHeader(http.StatusNotFound)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "No se encontró predicción para el bus " + busID,
        })
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "ok",
        "data":   prediction,
    })
}

func (h *Handlers) CalculateETA(w http.ResponseWriter, r *http.Request) {
    var req struct {
        BusID     string  `json:"bus_id"`
        Latitude  float64 `json:"latitude"`
        Longitude float64 `json:"longitude"`
        Speed     float64 `json:"speed"`
        Hour      int     `json:"hour"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(map[string]string{
            "error": "Invalid request body",
        })
        return
    }

    factor := h.factorCalc.CalculateCombinedFactor(req.Speed, req.Latitude, req.Longitude, req.Hour)

    baseETA := 60
    predictedETA := int(float64(baseETA) * factor)

    factors := &domain.ETAFactors{
        SpeedFactor:   h.factorCalc.CalculateSpeedFactor(req.Speed, req.Hour),
        TrafficFactor: h.factorCalc.CalculateTrafficFactor(req.Latitude, req.Longitude, req.Hour),
        WeatherFactor: h.factorCalc.CalculateWeatherFactor(),
        UpdatedAt:     time.Now(),
    }

    h.redisClient.SetETAFactors(req.BusID, factors)

    prediction := &domain.ETAPrediction{
        BusID:       req.BusID,
        CurrentLat:  req.Latitude,
        CurrentLng:  req.Longitude,
        ETA:         predictedETA,
        Confidence:  0.85,
        PredictedAt: time.Now(),
    }

    h.redisClient.SetPrediction(req.BusID, prediction)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "ok",
        "data": map[string]interface{}{
            "eta_seconds": predictedETA,
            "factor":      factor,
            "confidence":  0.85,
        },
    })
}

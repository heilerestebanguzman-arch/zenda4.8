package eta

import (
    "time"
)

type FeatureMapper struct {
    calc *FactorCalculator
}

func NewFeatureMapper() *FeatureMapper {
    return &FeatureMapper{
        calc: NewFactorCalculator(),
    }
}

type GPSData struct {
    BusID     string
    Latitude  float64
    Longitude float64
    Speed     float64
    Timestamp time.Time
}

func (m *FeatureMapper) MapToFeatures(gps GPSData) map[string]float64 {
    hour := gps.Timestamp.Hour()
    dayOfWeek := int(gps.Timestamp.Weekday())
    isWeekend := 0
    if dayOfWeek == 5 || dayOfWeek == 6 {
        isWeekend = 1
    }
    isRushHour := 0
    if (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) {
        isRushHour = 1
    }

    factor := m.calc.CalculateCombinedFactor(gps.Speed, gps.Latitude, gps.Longitude, hour)

    return map[string]float64{
        "hour":         float64(hour),
        "day_of_week":  float64(dayOfWeek),
        "is_weekend":   float64(isWeekend),
        "is_rush_hour": float64(isRushHour),
        "speed_factor": factor,
        "speed":        gps.Speed,
    }
}

package eta

import (
    "math"
)

type FactorCalculator struct{}

func NewFactorCalculator() *FactorCalculator {
    return &FactorCalculator{}
}

func (f *FactorCalculator) CalculateSpeedFactor(speed float64, hour int) float64 {
    baseFactor := 1.0

    if speed < 10 {
        baseFactor = 2.5
    } else if speed < 20 {
        baseFactor = 1.8
    } else if speed < 30 {
        baseFactor = 1.3
    } else {
        baseFactor = 1.0
    }

    if hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 {
        baseFactor *= 1.4
    }

    return baseFactor
}

func (f *FactorCalculator) CalculateTrafficFactor(lat, lng float64, hour int) float64 {
    baseFactor := 1.0

    if hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 {
        baseFactor = 1.6
    } else if hour >= 10 && hour <= 16 {
        baseFactor = 1.2
    }

    centerLat, centerLng := -17.393, -66.157
    distance := f.haversineDistance(lat, lng, centerLat, centerLng)
    if distance < 5 {
        baseFactor *= 1.3
    }

    return baseFactor
}

func (f *FactorCalculator) CalculateWeatherFactor() float64 {
    return 1.0
}

func (f *FactorCalculator) haversineDistance(lat1, lng1, lat2, lng2 float64) float64 {
    const earthRadius = 6371
    dLat := (lat2 - lat1) * math.Pi / 180
    dLng := (lng2 - lng1) * math.Pi / 180

    a := math.Sin(dLat/2)*math.Sin(dLat/2) +
        math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
            math.Sin(dLng/2)*math.Sin(dLng/2)
    c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

    return earthRadius * c
}

func (f *FactorCalculator) CalculateCombinedFactor(speed float64, lat, lng float64, hour int) float64 {
    speedFactor := f.CalculateSpeedFactor(speed, hour)
    trafficFactor := f.CalculateTrafficFactor(lat, lng, hour)
    weatherFactor := f.CalculateWeatherFactor()

    return speedFactor * trafficFactor * weatherFactor
}

package ports

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// Metrics contiene todas las métricas de Prometheus
type Metrics struct {
	GPSMessagesTotal  prometheus.Counter
	GPSMessagesErrors prometheus.Counter
	ActiveConnections prometheus.Gauge
	BusActiveCount    prometheus.Gauge
}

// NewMetrics inicializa las métricas
func NewMetrics() *Metrics {
	return &Metrics{
		GPSMessagesTotal: promauto.NewCounter(prometheus.CounterOpts{
			Name: "zenda_gps_messages_total",
			Help: "Total de mensajes GPS procesados",
		}),
		GPSMessagesErrors: promauto.NewCounter(prometheus.CounterOpts{
			Name: "zenda_gps_messages_errors_total",
			Help: "Total de errores al procesar mensajes GPS",
		}),
		ActiveConnections: promauto.NewGauge(prometheus.GaugeOpts{
			Name: "zenda_active_connections",
			Help: "Conexiones activas al sistema",
		}),
		BusActiveCount: promauto.NewGauge(prometheus.GaugeOpts{
			Name: "zenda_bus_active_count",
			Help: "Número de buses activos",
		}),
	}
}

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"modulo_9_incidentes/internal/api/middleware"
	"modulo_9_incidentes/internal/api/rest"
	"modulo_9_incidentes/internal/application"
	"modulo_9_incidentes/internal/infrastructure/events"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222"
	}

	publisher, err := events.NewNatsEventPublisher(natsURL)
	if err != nil {
		log.Fatalf("Error al conectar a NATS: %v", err)
	}
	defer publisher.Close()

	createIncidentUC := application.NewCreateIncidentUseCase(publisher)
	incidentHandler := rest.NewIncidentHandler(createIncidentUC)

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=UTF-8")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "ok",
			"service": "modulo_9_incidentes",
		})
	})

	// Aplicar middleware para asegurar UTF-8
	http.HandleFunc("/api/v1/incidents", middleware.EnsureUTF8Middleware(incidentHandler.CreateIncident))

	log.Printf("🚀 Módulo 9 - Incidentes corriendo en puerto %s", port)
	log.Printf("📊 Health check: http://localhost:%s/health", port)
	log.Printf("🆘 Botón de pánico: POST http://localhost:%s/api/v1/incidents", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error al iniciar servidor: %v", err)
	}
}

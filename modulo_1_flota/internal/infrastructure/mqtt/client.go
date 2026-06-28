package mqtt

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// GPSMessage representa los datos de telemetría recibidos desde el bus
type GPSMessage struct {
	BusID     string    `json:"bus_id"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Speed     float64   `json:"speed"`
	Heading   int       `json:"heading"`
	Accuracy  float64   `json:"accuracy"`
	Timestamp time.Time `json:"timestamp"`
}

// Client es el cliente MQTT para suscribirse a tópicos de telemetría
type Client struct {
	client  mqtt.Client
	logger  *slog.Logger
	handler MessageHandler
}

// MessageHandler es una función que procesa los mensajes recibidos
type MessageHandler func(msg GPSMessage) error

// NewClient crea un nuevo cliente MQTT
func NewClient(broker string, logger *slog.Logger, handler MessageHandler) *Client {
	opts := mqtt.NewClientOptions()
	opts.AddBroker(broker)
	opts.SetClientID("modulo_1_flota")
	opts.SetAutoReconnect(true)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(5 * time.Second)
	opts.SetKeepAlive(60 * time.Second)
	opts.SetPingTimeout(10 * time.Second)

	client := mqtt.NewClient(opts)

	return &Client{
		client:  client,
		logger:  logger,
		handler: handler,
	}
}

// Connect establece la conexión con el broker MQTT
func (c *Client) Connect(ctx context.Context) error {
	token := c.client.Connect()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-token.Done():
		if err := token.Error(); err != nil {
			return err
		}
	}

	c.logger.Info("Conectado al broker MQTT")
	return nil
}

// Subscribe se suscribe a un tópico y procesa los mensajes
func (c *Client) Subscribe(topic string) error {
	token := c.client.Subscribe(topic, 1, func(client mqtt.Client, msg mqtt.Message) {
		c.logger.Debug("Mensaje MQTT recibido", "topic", msg.Topic())

		var gpsMsg GPSMessage
		if err := json.Unmarshal(msg.Payload(), &gpsMsg); err != nil {
			c.logger.Error("Error al decodificar mensaje GPS", "error", err)
			return
		}

		// Procesar mensaje con el handler
		if err := c.handler(gpsMsg); err != nil {
			c.logger.Error("Error al procesar mensaje GPS", "error", err)
		}
	})

	if token.Wait() && token.Error() != nil {
		return token.Error()
	}

	c.logger.Info("Suscrito al tópico", "topic", topic)
	return nil
}

// Disconnect cierra la conexión MQTT
func (c *Client) Disconnect() {
	c.client.Disconnect(250)
	c.logger.Info("Desconectado del broker MQTT")
}

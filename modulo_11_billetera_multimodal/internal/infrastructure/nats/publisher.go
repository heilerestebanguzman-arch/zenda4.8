package nats

import (
	"encoding/json"
	"log"

	"github.com/nats-io/nats.go"
)

type EventPublisher struct {
	conn *nats.Conn
}

func NewEventPublisher(conn *nats.Conn) *EventPublisher {
	return &EventPublisher{conn: conn}
}

type WalletCreatedEvent struct {
	WalletID string  `json:"wallet_id"`
	UserID   string  `json:"user_id"`
	Balance  float64 `json:"balance"`
}

type WalletRechargedEvent struct {
	WalletID      string  `json:"wallet_id"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
}

type WalletPaymentEvent struct {
	WalletID      string  `json:"wallet_id"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
	Description   string  `json:"description"`
}

func (p *EventPublisher) PublishWalletCreated(walletID, userID string, balance float64) error {
	event := WalletCreatedEvent{
		WalletID: walletID,
		UserID:   userID,
		Balance:  balance,
	}
	return p.publish("wallet.created", event)
}

func (p *EventPublisher) PublishWalletRecharged(walletID, transactionID string, amount float64) error {
	event := WalletRechargedEvent{
		WalletID:      walletID,
		Amount:        amount,
		TransactionID: transactionID,
	}
	return p.publish("wallet.recharged", event)
}

func (p *EventPublisher) PublishWalletPayment(walletID, transactionID string, amount float64, description string) error {
	event := WalletPaymentEvent{
		WalletID:      walletID,
		Amount:        amount,
		TransactionID: transactionID,
		Description:   description,
	}
	return p.publish("wallet.payment", event)
}

func (p *EventPublisher) publish(subject string, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling event: %v", err)
		return err
	}
	err = p.conn.Publish(subject, jsonData)
	if err != nil {
		log.Printf("Error publishing to %s: %v", subject, err)
		return err
	}
	log.Printf("Event published to %s", subject)
	return nil
}

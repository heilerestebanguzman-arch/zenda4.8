package postgres

import (
	"database/sql"
	"fmt"
	"log/slog"
	"time"

	_ "github.com/lib/pq"
)

type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func NewConnection(cfg Config, logger *slog.Logger) (*sql.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("error al abrir conexión: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error al hacer ping a la base de datos: %w", err)
	}

	logger.Info("Conexión a PostgreSQL establecida", "database", cfg.DBName)
	return db, nil
}

func Close(db *sql.DB, logger *slog.Logger) {
	if err := db.Close(); err != nil {
		logger.Error("Error al cerrar conexión a PostgreSQL", "error", err)
	} else {
		logger.Info("Conexión a PostgreSQL cerrada correctamente")
	}
}

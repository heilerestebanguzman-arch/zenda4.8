package database

import (
    "database/sql"
    "fmt"
    "log"
    _ "github.com/lib/pq"
)

type Config struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

func NewConfig() Config {
    return Config{
        Host:     "localhost",
        Port:     "5432",
        User:     "zenda_admin",
        Password: "zenda_secure_pass_2026",
        DBName:   "zenda",
        SSLMode:  "disable",
    }
}

func Connect(cfg Config) (*sql.DB, error) {
    connStr := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode,
    )
    
    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, err
    }
    
    if err := db.Ping(); err != nil {
        return nil, err
    }
    
    log.Println("✅ Conectado a PostgreSQL exitosamente (M7)")
    return db, nil
}

func GetTenantSchema(tenantID string) string {
    return fmt.Sprintf("tenant_%s", tenantID)
}

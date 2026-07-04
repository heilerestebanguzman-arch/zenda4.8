package domain

import (
    "time"
    "github.com/google/uuid"
)

type Part struct {
    ID          uuid.UUID `json:"id"`
    PartNumber  string    `json:"part_number"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Category    string    `json:"category"`
    Stock       int       `json:"stock"`
    MinStock    int       `json:"min_stock"`
    Price       float64   `json:"price"`
    Supplier    string    `json:"supplier"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

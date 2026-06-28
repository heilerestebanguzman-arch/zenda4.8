package domain

import "context"

// BusRepository define las operaciones para gestionar buses
type BusRepository interface {
	Save(ctx context.Context, bus *Bus) error
	FindByID(ctx context.Context, id string) (*Bus, error)
	Update(ctx context.Context, bus *Bus) error
	Delete(ctx context.Context, id string) error
}

// LocationRepository define las operaciones para gestionar ubicaciones de buses
type LocationRepository interface {
	SavePosition(ctx context.Context, busID string, location Location) error
	GetLastPosition(ctx context.Context, busID string) (*Location, error)
	GetHistory(ctx context.Context, busID string, limit int) ([]Location, error)
}

-- ============================================
-- ZENDA v4.8 - Migración 001 (Inicial)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(20) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2000),
    capacity INTEGER NOT NULL CHECK (capacity >= 10 AND capacity <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
    route_id UUID,
    driver_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buses_plate ON buses(plate);

CREATE TABLE IF NOT EXISTS gps_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DECIMAL(11, 8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    speed DECIMAL(10, 2) DEFAULT 0,
    heading INTEGER DEFAULT 0,
    accuracy DECIMAL(10, 2) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gps_logs_bus_id ON gps_logs(bus_id);
CREATE INDEX idx_gps_logs_timestamp ON gps_logs(timestamp DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_buses_updated_at
    BEFORE UPDATE ON buses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

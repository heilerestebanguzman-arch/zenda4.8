-- =====================================================
-- ZENDA 4.8 - Módulo de Conductores (M10)
-- Migración 006: Tablas de conductores y verificación
-- =====================================================

-- 1. Tabla de conductores
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    identification_number VARCHAR(50) UNIQUE NOT NULL,
    identification_photo_front TEXT,
    identification_photo_back TEXT,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_photo TEXT,
    license_expiry_date DATE NOT NULL,
    selfie_photo TEXT,
    facial_verification_status VARCHAR(20) DEFAULT 'PENDING',
    facial_verification_score DECIMAL(5,2),
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_drivers_identification_number ON drivers(identification_number);
CREATE INDEX IF NOT EXISTS idx_drivers_license_number ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_verification_status ON drivers(verification_status);

-- 3. Tabla de logs de verificación
CREATE TABLE IF NOT EXISTS driver_verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    verification_type VARCHAR(50),
    status VARCHAR(20),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índice para logs
CREATE INDEX IF NOT EXISTS idx_driver_verification_logs_driver_id ON driver_verification_logs(driver_id);

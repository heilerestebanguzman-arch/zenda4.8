-- ============================================
-- MÓDULO 6 - CMMS (MANTENIMIENTO)
-- ============================================

-- Tabla de vehículos (extensión de buses)
CREATE TABLE IF NOT EXISTS cmms_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id VARCHAR(50) NOT NULL UNIQUE,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    plate VARCHAR(20),
    mileage INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de órdenes de mantenimiento
CREATE TABLE IF NOT EXISTS cmms_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id UUID NOT NULL REFERENCES cmms_vehicles(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY', 'INSPECTION')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'APPROVED')),
    scheduled_date DATE,
    completed_date DATE,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    technician VARCHAR(100),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de repuestos
CREATE TABLE IF NOT EXISTS cmms_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    price DECIMAL(10,2) DEFAULT 0,
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de órdenes - repuestos (relación muchos a muchos)
CREATE TABLE IF NOT EXISTS cmms_order_parts (
    order_id UUID NOT NULL REFERENCES cmms_orders(id) ON DELETE CASCADE,
    part_id UUID NOT NULL REFERENCES cmms_parts(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (order_id, part_id)
);

-- Índices
CREATE INDEX idx_cmms_orders_vehicle_id ON cmms_orders(vehicle_id);
CREATE INDEX idx_cmms_orders_status ON cmms_orders(status);
CREATE INDEX idx_cmms_orders_priority ON cmms_orders(priority);
CREATE INDEX idx_cmms_orders_scheduled_date ON cmms_orders(scheduled_date);
CREATE INDEX idx_cmms_parts_part_number ON cmms_parts(part_number);
CREATE INDEX idx_cmms_parts_category ON cmms_parts(category);

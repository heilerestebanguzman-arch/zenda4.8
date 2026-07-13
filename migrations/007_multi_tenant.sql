-- =====================================================
-- ZENDA 4.8 - Migración Multi-tenant
-- Fecha: 2026-07-13
-- =====================================================

-- 1. Agregar columna tenant_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'default';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'default';
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'default';
ALTER TABLE revenue_events ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50) DEFAULT 'default';

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_drivers_tenant_id ON drivers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_tenant_id ON revenue_events(tenant_id);

-- 3. Actualizar datos existentes
UPDATE users SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE orders SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE drivers SET tenant_id = 'default' WHERE tenant_id IS NULL;
UPDATE revenue_events SET tenant_id = 'default' WHERE tenant_id IS NULL;

-- 4. Hacer NOT NULL
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE drivers ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE revenue_events ALTER COLUMN tenant_id SET NOT NULL;

-- 5. Crear tabla de tenants (opcional)
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar tenant por defecto
INSERT INTO tenants (id, name, domain) 
VALUES ('default', 'ZENDA Default', 'localhost')
ON CONFLICT (id) DO NOTHING;

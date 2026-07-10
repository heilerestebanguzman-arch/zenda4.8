-- =====================================================
-- ZENDA 4.8 - Módulo de Reportes (M13)
-- Migración 005: Tablas de ingresos y reportes
-- =====================================================

-- 1. Tabla de eventos de ingresos
CREATE TABLE IF NOT EXISTS revenue_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(50),
    description TEXT,
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_revenue_events_recorded_at ON revenue_events(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_events_status ON revenue_events(status);
CREATE INDEX IF NOT EXISTS idx_revenue_events_order_id ON revenue_events(order_id);

-- 2. Vista materializada para reportes diarios
CREATE MATERIALIZED VIEW IF NOT EXISTS revenue_daily_summary AS
SELECT 
    DATE(recorded_at) as date,
    COUNT(order_id) as total_orders,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_order_value,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_orders,
    SUM(CASE WHEN status = 'REFUNDED' THEN 1 ELSE 0 END) as refunded_orders
FROM revenue_events
WHERE status IN ('COMPLETED', 'FAILED', 'REFUNDED')
GROUP BY DATE(recorded_at)
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_daily_summary_date ON revenue_daily_summary(date);

-- 3. Datos de prueba
INSERT INTO revenue_events (order_id, user_id, amount, status, payment_method, description)
VALUES 
    (gen_random_uuid(), gen_random_uuid(), 150.00, 'COMPLETED', 'CREDIT_CARD', 'Orden de mantenimiento #1'),
    (gen_random_uuid(), gen_random_uuid(), 320.50, 'COMPLETED', 'DEBIT_CARD', 'Orden de mantenimiento #2'),
    (gen_random_uuid(), gen_random_uuid(), 75.00, 'PENDING', 'CASH', 'Orden de mantenimiento #3')
ON CONFLICT DO NOTHING;

REFRESH MATERIALIZED VIEW revenue_daily_summary;

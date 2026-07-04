-- ============================================
-- MÓDULO 7 - CLEARINGHOUSE (LIQUIDACIÓN)
-- ============================================

-- Tabla de operadores
CREATE TABLE IF NOT EXISTS ch_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 0,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de liquidaciones
CREATE TABLE IF NOT EXISTS ch_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_number VARCHAR(50) NOT NULL UNIQUE,
    operator_id UUID NOT NULL REFERENCES ch_operators(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_rides INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_commission DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_date DATE,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS ch_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID REFERENCES ch_settlements(id) ON DELETE CASCADE,
    ride_id VARCHAR(50) NOT NULL,
    operator_id UUID NOT NULL REFERENCES ch_operators(id),
    passenger_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) DEFAULT 0,
    type VARCHAR(30) NOT NULL CHECK (type IN ('RIDE', 'REFUND', 'ADJUSTMENT')),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ch_settlements_operator_id ON ch_settlements(operator_id);
CREATE INDEX idx_ch_settlements_status ON ch_settlements(status);
CREATE INDEX idx_ch_settlements_period ON ch_settlements(period_start, period_end);
CREATE INDEX idx_ch_transactions_settlement_id ON ch_transactions(settlement_id);
CREATE INDEX idx_ch_transactions_operator_id ON ch_transactions(operator_id);
CREATE INDEX idx_ch_operators_code ON ch_operators(code);

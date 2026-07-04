-- ============================================
-- MÓDULO 10 - HR CONDUCTORES
-- ============================================

-- Tabla de conductores
CREATE TABLE IF NOT EXISTS hr_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    document_id VARCHAR(50) NOT NULL UNIQUE,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_expiry DATE,
    license_type VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    hire_date DATE NOT NULL,
    termination_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de contratos
CREATE TABLE IF NOT EXISTS hr_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES hr_drivers(id) ON DELETE CASCADE,
    contract_number VARCHAR(50) NOT NULL UNIQUE,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('PERMANENT', 'TEMPORARY', 'CONTRACTOR')),
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(10,2) NOT NULL,
    benefits JSONB,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED')),
    signed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de evaluaciones
CREATE TABLE IF NOT EXISTS hr_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES hr_drivers(id) ON DELETE CASCADE,
    evaluation_date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PERFORMANCE', 'SAFETY', 'ANNUAL')),
    score DECIMAL(5,2) NOT NULL,
    comments TEXT,
    evaluator VARCHAR(100),
    next_evaluation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_hr_drivers_email ON hr_drivers(email);
CREATE INDEX idx_hr_drivers_document_id ON hr_drivers(document_id);
CREATE INDEX idx_hr_drivers_license_number ON hr_drivers(license_number);
CREATE INDEX idx_hr_drivers_status ON hr_drivers(status);
CREATE INDEX idx_hr_contracts_driver_id ON hr_contracts(driver_id);
CREATE INDEX idx_hr_contracts_status ON hr_contracts(status);
CREATE INDEX idx_hr_evaluations_driver_id ON hr_evaluations(driver_id);

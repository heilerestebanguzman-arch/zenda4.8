-- Eliminar índices
DROP INDEX IF EXISTS idx_recharge_orders_wallet_id;
DROP INDEX IF EXISTS idx_recharge_orders_status;

-- Eliminar tabla
DROP TABLE IF EXISTS recharge_orders;

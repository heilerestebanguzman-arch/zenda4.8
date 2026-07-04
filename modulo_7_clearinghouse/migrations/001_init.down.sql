DROP INDEX IF EXISTS idx_ch_operators_code;
DROP INDEX IF EXISTS idx_ch_transactions_operator_id;
DROP INDEX IF EXISTS idx_ch_transactions_settlement_id;
DROP INDEX IF EXISTS idx_ch_settlements_period;
DROP INDEX IF EXISTS idx_ch_settlements_status;
DROP INDEX IF EXISTS idx_ch_settlements_operator_id;

DROP TABLE IF EXISTS ch_transactions;
DROP TABLE IF EXISTS ch_settlements;
DROP TABLE IF EXISTS ch_operators;

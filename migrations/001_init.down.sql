DROP TRIGGER IF EXISTS update_buses_updated_at ON buses;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS gps_logs;
DROP TABLE IF EXISTS buses;
DROP EXTENSION IF EXISTS "uuid-ossp";

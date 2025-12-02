-- Certus Database Initialization Script
-- This script runs on first container startup

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS certus;

-- Set search path
SET search_path TO certus, public;

-- Grant permissions
GRANT ALL ON SCHEMA certus TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA certus TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA certus TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Certus database initialized successfully';
END $$;

-- =====================================================
-- ELITE AI-ARCHITECT CHALLENGE PLATFORM
-- Neon PostgreSQL Database Setup Script
-- =====================================================
-- Run this script in your Neon SQL Editor to set up all tables
-- OR visit /setup in your app to auto-initialize
-- =====================================================
-- 1. CANDIDATES TABLE
-- Stores registered candidates for the challenge
-- =====================================================
CREATE TABLE
    IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            status VARCHAR(50) DEFAULT 'pending'
    );

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates (email);

-- =====================================================
-- 2. TEST SESSIONS TABLE
-- Tracks individual challenge sessions
-- =====================================================
CREATE TABLE
    IF NOT EXISTS test_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        candidate_id UUID REFERENCES candidates (id) ON DELETE CASCADE,
        challenge_id VARCHAR(100) DEFAULT 'default',
        started_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            ended_at TIMESTAMP
        WITH
            TIME ZONE,
            time_remaining INTEGER DEFAULT 2700, -- 45 minutes in seconds
            status VARCHAR(50) DEFAULT 'in_progress',
            final_score DECIMAL(5, 2),
            security_score DECIMAL(5, 2) DEFAULT 0,
            architecture_score DECIMAL(5, 2) DEFAULT 0,
            performance_score DECIMAL(5, 2) DEFAULT 0,
            tests_passed INTEGER DEFAULT 0,
            total_tests INTEGER DEFAULT 24,
            current_file VARCHAR(255) DEFAULT 'main.py',
            updated_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW ()
    );

-- Indexes for session queries
CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions (candidate_id);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions (status);

-- =====================================================
-- 3. CODE SNAPSHOTS TABLE
-- Stores periodic code snapshots during the challenge
-- =====================================================
CREATE TABLE
    IF NOT EXISTS code_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        session_id UUID REFERENCES test_sessions (id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        language VARCHAR(50) DEFAULT 'python',
        timestamp TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW ()
    );

-- Index for fetching snapshots by session
CREATE INDEX IF NOT EXISTS idx_snapshots_session ON code_snapshots (session_id);

-- =====================================================
-- 4. ANTI-CHEAT EVENTS TABLE
-- Logs all security violations during sessions
-- =====================================================
CREATE TABLE
    IF NOT EXISTS anti_cheat_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        session_id UUID REFERENCES test_sessions (id) ON DELETE CASCADE,
        event_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        details TEXT,
        metadata JSONB DEFAULT '{}',
        timestamp TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW ()
    );

-- Indexes for anti-cheat queries
CREATE INDEX IF NOT EXISTS idx_anticheat_session ON anti_cheat_events (session_id);

CREATE INDEX IF NOT EXISTS idx_anticheat_severity ON anti_cheat_events (severity);

-- =====================================================
-- 5. ADMIN USERS TABLE
-- Stores admin accounts for the dashboard
-- =====================================================
CREATE TABLE
    IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP
        WITH
            TIME ZONE DEFAULT NOW (),
            last_login TIMESTAMP
        WITH
            TIME ZONE
    );

-- Index for admin login
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users (email);

-- =====================================================
-- 6. INSERT DEFAULT ADMIN USER
-- Password: admin123 (SHA-256 hashed)
-- =====================================================
INSERT INTO
    admin_users (email, password_hash, name, role)
VALUES
    (
        'abhiisingh240@gmail.com',
        '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        'Abhishek Singh',
        'super_admin'
    ) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- USEFUL QUERIES FOR ADMIN
-- =====================================================
-- View all active sessions with candidate info:
-- SELECT ts.*, c.name, c.email 
-- FROM test_sessions ts 
-- JOIN candidates c ON ts.candidate_id = c.id 
-- WHERE ts.status = 'in_progress';
-- View anti-cheat violations by severity:
-- SELECT severity, COUNT(*) as count 
-- FROM anti_cheat_events 
-- GROUP BY severity;
-- Get candidate's latest code:
-- SELECT code, timestamp 
-- FROM code_snapshots 
-- WHERE session_id = 'YOUR_SESSION_ID' 
-- ORDER BY timestamp DESC 
-- LIMIT 1;
-- Get session statistics:
-- SELECT 
--   COUNT(*) as total_sessions,
--   COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active,
--   COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
--   AVG(final_score) as avg_score
-- FROM test_sessions;
-- =====================================================
-- ENVIRONMENT VARIABLE SETUP
-- =====================================================
-- Add this to your .env.local file:
-- DATABASE_URL=postgresql://username:password@your-neon-host.neon.tech/dbname?sslmode=require
-- =====================================================
-- END OF SETUP SCRIPT
-- =====================================================
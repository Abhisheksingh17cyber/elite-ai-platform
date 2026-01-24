import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Initialize database schema
export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL not configured' },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    // Create tables
    await sql`
      -- Candidates Table
      CREATE TABLE IF NOT EXISTS candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'pending'
      )
    `;

    await sql`
      -- Test Sessions Table
      CREATE TABLE IF NOT EXISTS test_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,
        time_remaining INTEGER DEFAULT 2700,
        status VARCHAR(50) DEFAULT 'in_progress',
        final_score DECIMAL(5,2),
        security_score DECIMAL(5,2) DEFAULT 0,
        architecture_score DECIMAL(5,2) DEFAULT 0,
        performance_score DECIMAL(5,2) DEFAULT 0,
        tests_passed INTEGER DEFAULT 0,
        total_tests INTEGER DEFAULT 24,
        current_file VARCHAR(255) DEFAULT 'main.py'
      )
    `;

    await sql`
      -- Code Snapshots Table
      CREATE TABLE IF NOT EXISTS code_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active_file VARCHAR(255) NOT NULL,
        files JSONB NOT NULL,
        auto_saved BOOLEAN DEFAULT true
      )
    `;

    await sql`
      -- Anti-Cheat Events Table
      CREATE TABLE IF NOT EXISTS anti_cheat_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        event_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        details TEXT,
        action_taken VARCHAR(255)
      )
    `;

    await sql`
      -- Admin Users Table
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions(candidate_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_snapshots_session ON code_snapshots(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_anticheat_session ON anti_cheat_events(session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email)`;

    // Insert or update default admin user (password: admin123 hashed with SHA-256)
    await sql`
      INSERT INTO admin_users (email, name, password_hash, role)
      VALUES ('abhiisingh240@gmail.com', 'Abhishek Singh', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'super_admin')
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        name = 'Abhishek Singh',
        role = 'super_admin'
    `;

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to initialize the database'
  });
}

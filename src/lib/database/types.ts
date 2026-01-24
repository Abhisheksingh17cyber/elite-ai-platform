// Database Types for Neon PostgreSQL Integration

export interface Candidate {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  status: 'pending' | 'active' | 'completed' | 'disqualified';
}

export interface TestSession {
  id: string;
  candidate_id: string;
  started_at: Date;
  ended_at: Date | null;
  time_remaining: number;
  status: 'in_progress' | 'completed' | 'timed_out' | 'terminated';
  final_score: number | null;
  security_score: number;
  architecture_score: number;
  performance_score: number;
  tests_passed: number;
  total_tests: number;
}

export interface CodeSnapshot {
  id: string;
  session_id: string;
  timestamp: Date;
  active_file: string;
  files: Record<string, string>;
  auto_saved: boolean;
}

export interface AntiCheatEvent {
  id: string;
  session_id: string;
  timestamp: Date;
  event_type: AntiCheatEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  action_taken: string;
}

export type AntiCheatEventType = 
  | 'tab_switch'
  | 'window_blur'
  | 'copy_attempt'
  | 'paste_attempt'
  | 'screenshot_attempt'
  | 'devtools_open'
  | 'multiple_monitors'
  | 'right_click'
  | 'keyboard_shortcut'
  | 'screen_share'
  | 'virtual_machine'
  | 'suspicious_typing'
  | 'idle_too_long';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin' | 'proctor';
  created_at: Date;
}

export interface LiveMonitoringData {
  session_id: string;
  candidate_name: string;
  candidate_email: string;
  current_file: string;
  time_remaining: number;
  current_score: number;
  anti_cheat_warnings: number;
  status: 'active' | 'suspicious' | 'flagged';
  last_activity: Date;
  code_changes_count: number;
}

export interface TestStatistics {
  total_candidates: number;
  active_sessions: number;
  completed_sessions: number;
  average_score: number;
  pass_rate: number;
  average_completion_time: number;
  anti_cheat_flags: number;
}

// Database Schema SQL
export const DATABASE_SCHEMA = `
-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending'
);

-- Test Sessions Table
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  time_remaining INTEGER DEFAULT 7200,
  status VARCHAR(50) DEFAULT 'in_progress',
  final_score DECIMAL(5,2),
  security_score DECIMAL(5,2) DEFAULT 0,
  architecture_score DECIMAL(5,2) DEFAULT 0,
  performance_score DECIMAL(5,2) DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  total_tests INTEGER DEFAULT 24
);

-- Code Snapshots Table
CREATE TABLE IF NOT EXISTS code_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active_file VARCHAR(255),
  files JSONB,
  auto_saved BOOLEAN DEFAULT true
);

-- Anti-Cheat Events Table
CREATE TABLE IF NOT EXISTS anti_cheat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  details TEXT,
  action_taken TEXT
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'proctor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions(status);
CREATE INDEX IF NOT EXISTS idx_snapshots_session ON code_snapshots(session_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_session ON anti_cheat_events(session_id);
CREATE INDEX IF NOT EXISTS idx_anti_cheat_severity ON anti_cheat_events(severity);
`;

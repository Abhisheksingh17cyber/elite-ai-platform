// Neon Database Client
// Connect using MCP server: npx -y mcp-remote@latest https://mcp.neon.tech/mcp

import { neon, neonConfig } from '@neondatabase/serverless';
import type { 
  Candidate, 
  TestSession, 
  CodeSnapshot, 
  AntiCheatEvent, 
  LiveMonitoringData,
  TestStatistics 
} from './types';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!url) {
    console.warn('Database URL not configured. Using mock data.');
    return null;
  }
  return url;
};

// Create SQL client
const createSqlClient = () => {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
};

// Database Operations
export const db = {
  // Candidate Operations
  async createCandidate(email: string, name: string): Promise<Candidate | null> {
    const sql = createSqlClient();
    if (!sql) return null;
    
    const result = await sql`
      INSERT INTO candidates (email, name, status)
      VALUES (${email}, ${name}, 'pending')
      RETURNING *
    `;
    return result[0] as Candidate;
  },

  async getCandidateByEmail(email: string): Promise<Candidate | null> {
    const sql = createSqlClient();
    if (!sql) return null;
    
    const result = await sql`
      SELECT * FROM candidates WHERE email = ${email}
    `;
    return result[0] as Candidate || null;
  },

  async updateCandidateStatus(id: string, status: Candidate['status']): Promise<void> {
    const sql = createSqlClient();
    if (!sql) return;
    
    await sql`
      UPDATE candidates SET status = ${status} WHERE id = ${id}
    `;
  },

  // Session Operations
  async createSession(candidateId: string): Promise<TestSession | null> {
    const sql = createSqlClient();
    if (!sql) return null;
    
    const result = await sql`
      INSERT INTO test_sessions (candidate_id, time_remaining)
      VALUES (${candidateId}, 7200)
      RETURNING *
    `;
    return result[0] as TestSession;
  },

  async getSession(sessionId: string): Promise<TestSession | null> {
    const sql = createSqlClient();
    if (!sql) return null;
    
    const result = await sql`
      SELECT * FROM test_sessions WHERE id = ${sessionId}
    `;
    return result[0] as TestSession || null;
  },

  async updateSession(sessionId: string, updates: Partial<TestSession>): Promise<void> {
    const sql = createSqlClient();
    if (!sql) return;
    
    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');
    
    await sql`
      UPDATE test_sessions 
      SET security_score = ${updates.security_score || 0},
          architecture_score = ${updates.architecture_score || 0},
          performance_score = ${updates.performance_score || 0},
          tests_passed = ${updates.tests_passed || 0},
          time_remaining = ${updates.time_remaining || 0}
      WHERE id = ${sessionId}
    `;
  },

  async endSession(sessionId: string, finalScore: number, status: TestSession['status']): Promise<void> {
    const sql = createSqlClient();
    if (!sql) return;
    
    await sql`
      UPDATE test_sessions 
      SET ended_at = NOW(), final_score = ${finalScore}, status = ${status}
      WHERE id = ${sessionId}
    `;
  },

  // Code Snapshot Operations
  async saveCodeSnapshot(
    sessionId: string, 
    activeFile: string, 
    files: Record<string, string>
  ): Promise<void> {
    const sql = createSqlClient();
    if (!sql) return;
    
    await sql`
      INSERT INTO code_snapshots (session_id, active_file, files)
      VALUES (${sessionId}, ${activeFile}, ${JSON.stringify(files)})
    `;
  },

  async getCodeSnapshots(sessionId: string): Promise<CodeSnapshot[]> {
    const sql = createSqlClient();
    if (!sql) return [];
    
    const result = await sql`
      SELECT * FROM code_snapshots 
      WHERE session_id = ${sessionId}
      ORDER BY timestamp DESC
    `;
    return result as CodeSnapshot[];
  },

  // Anti-Cheat Operations
  async logAntiCheatEvent(
    sessionId: string,
    eventType: AntiCheatEvent['event_type'],
    severity: AntiCheatEvent['severity'],
    details: string,
    actionTaken: string
  ): Promise<void> {
    const sql = createSqlClient();
    if (!sql) return;
    
    await sql`
      INSERT INTO anti_cheat_events (session_id, event_type, severity, details, action_taken)
      VALUES (${sessionId}, ${eventType}, ${severity}, ${details}, ${actionTaken})
    `;
  },

  async getAntiCheatEvents(sessionId: string): Promise<AntiCheatEvent[]> {
    const sql = createSqlClient();
    if (!sql) return [];
    
    const result = await sql`
      SELECT * FROM anti_cheat_events 
      WHERE session_id = ${sessionId}
      ORDER BY timestamp DESC
    `;
    return result as AntiCheatEvent[];
  },

  // Admin Dashboard Operations
  async getLiveMonitoringData(): Promise<LiveMonitoringData[]> {
    const sql = createSqlClient();
    if (!sql) return [];
    
    const result = await sql`
      SELECT 
        ts.id as session_id,
        c.name as candidate_name,
        c.email as candidate_email,
        ts.time_remaining,
        (ts.security_score + ts.architecture_score + ts.performance_score) as current_score,
        ts.status,
        COUNT(ace.id) FILTER (WHERE ace.severity IN ('high', 'critical')) as anti_cheat_warnings
      FROM test_sessions ts
      JOIN candidates c ON ts.candidate_id = c.id
      LEFT JOIN anti_cheat_events ace ON ts.id = ace.session_id
      WHERE ts.status = 'in_progress'
      GROUP BY ts.id, c.name, c.email
      ORDER BY ts.started_at DESC
    `;
    return result as LiveMonitoringData[];
  },

  async getTestStatistics(): Promise<TestStatistics> {
    const sql = createSqlClient();
    if (!sql) {
      return {
        total_candidates: 0,
        active_sessions: 0,
        completed_sessions: 0,
        average_score: 0,
        pass_rate: 0,
        average_completion_time: 0,
        anti_cheat_flags: 0
      };
    }
    
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM candidates) as total_candidates,
        (SELECT COUNT(*) FROM test_sessions WHERE status = 'in_progress') as active_sessions,
        (SELECT COUNT(*) FROM test_sessions WHERE status = 'completed') as completed_sessions,
        (SELECT AVG(final_score) FROM test_sessions WHERE final_score IS NOT NULL) as average_score,
        (SELECT COUNT(*) FILTER (WHERE final_score >= 85) * 100.0 / NULLIF(COUNT(*), 0) 
         FROM test_sessions WHERE final_score IS NOT NULL) as pass_rate,
        (SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60) 
         FROM test_sessions WHERE ended_at IS NOT NULL) as average_completion_time,
        (SELECT COUNT(*) FROM anti_cheat_events WHERE severity IN ('high', 'critical')) as anti_cheat_flags
    `;
    return stats[0] as TestStatistics;
  },

  async getAllSessions(): Promise<(TestSession & { candidate: Candidate })[]> {
    const sql = createSqlClient();
    if (!sql) return [];
    
    const result = await sql`
      SELECT ts.*, row_to_json(c.*) as candidate
      FROM test_sessions ts
      JOIN candidates c ON ts.candidate_id = c.id
      ORDER BY ts.started_at DESC
    `;
    return result as (TestSession & { candidate: Candidate })[];
  }
};

export default db;

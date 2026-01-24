import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Get live monitoring data for admin dashboard
export async function GET() {
  try {
    const sql = getDatabase();
    
    // Get active sessions with candidate details
    const activeSessions = await sql`
      SELECT 
        ts.id,
        ts.candidate_id,
        ts.time_remaining,
        ts.status,
        ts.security_score,
        ts.architecture_score,
        ts.performance_score,
        ts.tests_passed,
        ts.started_at,
        c.email,
        c.name,
        (SELECT active_file FROM code_snapshots WHERE session_id = ts.id ORDER BY timestamp DESC LIMIT 1) as current_code,
        (SELECT COUNT(*) FROM anti_cheat_events WHERE session_id = ts.id) as violation_count
      FROM test_sessions ts
      JOIN candidates c ON ts.candidate_id = c.id
      WHERE ts.status = 'in_progress'
      ORDER BY ts.started_at DESC
    `;

    // Get test statistics
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM test_sessions WHERE status = 'in_progress') as active_tests,
        (SELECT COUNT(*) FROM test_sessions WHERE status = 'completed' AND ended_at > NOW() - INTERVAL '24 hours') as completed_today,
        (SELECT AVG(security_score + architecture_score + performance_score) / 3 FROM test_sessions WHERE status = 'completed') as avg_score,
        (SELECT COUNT(*) FROM anti_cheat_events WHERE severity = 'critical' AND timestamp > NOW() - INTERVAL '24 hours') as critical_violations
    `;

    // Get recent anti-cheat events
    const recentViolations = await sql`
      SELECT 
        ace.id,
        ace.session_id,
        ace.event_type,
        ace.severity,
        ace.details,
        ace.timestamp,
        c.email as candidate_email,
        c.name as candidate_name
      FROM anti_cheat_events ace
      JOIN test_sessions ts ON ace.session_id = ts.id
      JOIN candidates c ON ts.candidate_id = c.id
      ORDER BY ace.timestamp DESC
      LIMIT 20
    `;

    // Transform active sessions to monitoring format
    const candidates = activeSessions.map((session, index) => ({
      id: session.candidate_id?.toString() || `candidate-${index}`,
      name: session.name || 'Unknown',
      email: session.email || 'unknown@email.com',
      status: 'active' as const,
      sessionId: session.id?.toString() || '',
      currentCode: session.current_code || '',
      timeRemaining: session.time_remaining || 7200,
      violations: Number(session.violation_count) || 0,
      scores: {
        security: session.security_score || 0,
        architecture: session.architecture_score || 0,
        performance: session.performance_score || 0
      },
      startedAt: session.started_at || new Date().toISOString()
    }));

    const statistics = {
      activeTests: Number(stats[0]?.active_tests) || 0,
      completedToday: Number(stats[0]?.completed_today) || 0,
      averageScore: Math.round(Number(stats[0]?.avg_score) || 0),
      criticalViolations: Number(stats[0]?.critical_violations) || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        candidates,
        statistics,
        recentViolations
      }
    });

  } catch (error) {
    console.error('Get monitoring data error:', error);
    return NextResponse.json(
      { error: 'Failed to get monitoring data', details: String(error) },
      { status: 500 }
    );
  }
}

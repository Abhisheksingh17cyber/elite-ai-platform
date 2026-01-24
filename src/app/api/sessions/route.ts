import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Get all active sessions (for admin monitoring)
export async function GET(request: NextRequest) {
  try {
    const sql = getDatabase();
    const status = request.nextUrl.searchParams.get('status') || 'in_progress';
    
    const sessions = await sql`
      SELECT ts.*, c.email, c.name,
             (SELECT COUNT(*) FROM anti_cheat_events ace WHERE ace.session_id = ts.id) as violation_count,
             (SELECT code FROM code_snapshots cs WHERE cs.session_id = ts.id ORDER BY timestamp DESC LIMIT 1) as latest_code
      FROM test_sessions ts
      JOIN candidates c ON ts.candidate_id = c.id
      WHERE ts.status = ${status}
      ORDER BY ts.started_at DESC
    `;

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions', details: String(error) },
      { status: 500 }
    );
  }
}

// Create a new session
export async function POST(request: NextRequest) {
  try {
    const sql = getDatabase();
    const { candidateId, challengeId } = await request.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // End any existing in-progress sessions for this candidate
    await sql`
      UPDATE test_sessions 
      SET status = 'terminated', ended_at = NOW()
      WHERE candidate_id = ${candidateId} AND status = 'in_progress'
    `;

    // Create new session
    const session = await sql`
      INSERT INTO test_sessions (candidate_id, challenge_id, time_remaining, status)
      VALUES (${candidateId}, ${challengeId || 'default'}, 7200, 'in_progress')
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      session: session[0]
    });

  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session', details: String(error) },
      { status: 500 }
    );
  }
}

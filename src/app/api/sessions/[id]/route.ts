import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDatabase();
    const { id } = await params;

    const session = await sql`
      SELECT ts.*, c.email, c.name
      FROM test_sessions ts
      JOIN candidates c ON ts.candidate_id = c.id
      WHERE ts.id = ${id}
    `;

    if (session.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get code snapshots
    const snapshots = await sql`
      SELECT * FROM code_snapshots 
      WHERE session_id = ${id}
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    // Get anti-cheat events
    const violations = await sql`
      SELECT * FROM anti_cheat_events
      WHERE session_id = ${id}
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({
      success: true,
      session: session[0],
      snapshots,
      violations
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session', details: String(error) },
      { status: 500 }
    );
  }
}

// Update session (time, scores, status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDatabase();
    const { id } = await params;
    const updates = await request.json();

    // Update each field individually using tagged template literals
    const {
      time_remaining,
      status,
      security_score,
      architecture_score,
      performance_score,
      tests_passed
    } = updates;

    // Build update query based on provided fields
    let result;

    if (status === 'completed' || status === 'terminated') {
      // Update with ended_at timestamp
      result = await sql`
        UPDATE test_sessions 
        SET 
          time_remaining = COALESCE(${time_remaining ?? null}, time_remaining),
          status = COALESCE(${status ?? null}, status),
          security_score = COALESCE(${security_score ?? null}, security_score),
          architecture_score = COALESCE(${architecture_score ?? null}, architecture_score),
          performance_score = COALESCE(${performance_score ?? null}, performance_score),
          tests_passed = COALESCE(${tests_passed ?? null}, tests_passed),
          ended_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      // Also update the candidate status to inactive
      if (result.length > 0) {
        await sql`
          UPDATE candidates 
          SET status = 'inactive'
          WHERE id = ${result[0].candidate_id}
        `;
      }
    } else {
      result = await sql`
        UPDATE test_sessions 
        SET 
          time_remaining = COALESCE(${time_remaining ?? null}, time_remaining),
          status = COALESCE(${status ?? null}, status),
          security_score = COALESCE(${security_score ?? null}, security_score),
          architecture_score = COALESCE(${architecture_score ?? null}, architecture_score),
          performance_score = COALESCE(${performance_score ?? null}, performance_score),
          tests_passed = COALESCE(${tests_passed ?? null}, tests_passed)
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: result[0]
    });

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: String(error) },
      { status: 500 }
    );
  }
}

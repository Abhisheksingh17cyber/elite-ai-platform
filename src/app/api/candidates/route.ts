import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Create a new candidate and start their session
export async function POST(request: NextRequest) {
  try {
    const sql = getDatabase();
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if candidate already exists
    const existing = await sql`
      SELECT * FROM candidates WHERE email = ${email}
    `;

    let candidate;
    if (existing.length > 0) {
      candidate = existing[0];
      // Update status to active
      await sql`
        UPDATE candidates SET status = 'active' WHERE id = ${candidate.id}
      `;
    } else {
      // Create new candidate
      const result = await sql`
        INSERT INTO candidates (email, name, status)
        VALUES (${email}, ${name}, 'active')
        RETURNING *
      `;
      candidate = result[0];
    }

    // Create a new test session
    const session = await sql`
      INSERT INTO test_sessions (candidate_id, time_remaining, status)
      VALUES (${candidate.id}, 7200, 'in_progress')
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      candidate,
      session: session[0]
    });

  } catch (error) {
    console.error('Candidate registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register candidate', details: String(error) },
      { status: 500 }
    );
  }
}

// Get candidate by email
export async function GET(request: NextRequest) {
  try {
    const sql = getDatabase();
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const candidate = await sql`
      SELECT c.*, ts.id as session_id, ts.status as session_status, 
             ts.time_remaining, ts.security_score, ts.architecture_score,
             ts.performance_score, ts.tests_passed
      FROM candidates c
      LEFT JOIN test_sessions ts ON c.id = ts.candidate_id 
        AND ts.status = 'in_progress'
      WHERE c.email = ${email}
      ORDER BY ts.started_at DESC
      LIMIT 1
    `;

    if (candidate.length === 0) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      candidate: candidate[0]
    });

  } catch (error) {
    console.error('Get candidate error:', error);
    return NextResponse.json(
      { error: 'Failed to get candidate', details: String(error) },
      { status: 500 }
    );
  }
}

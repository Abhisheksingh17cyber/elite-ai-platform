import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Candidate login - verify email and get existing session
export async function POST(request: NextRequest) {
  try {
    const sql = getDatabase();
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if candidate exists
    const existingCandidate = await sql`
      SELECT id, email, name, created_at, status
      FROM candidates 
      WHERE email = ${email}
    `;

    if (existingCandidate.length > 0) {
      // Candidate exists, check for active session
      const candidate = existingCandidate[0];
      
      const activeSession = await sql`
        SELECT id, started_at, time_remaining, status,
               security_score, architecture_score, performance_score,
               tests_passed, total_tests
        FROM test_sessions 
        WHERE candidate_id = ${candidate.id}
        ORDER BY started_at DESC
        LIMIT 1
      `;

      if (activeSession.length > 0) {
        const session = activeSession[0];
        
        // If session is still in progress, allow them to continue
        if (session.status === 'in_progress') {
          return NextResponse.json({
            success: true,
            isExisting: true,
            canContinue: true,
            candidate: candidate,
            session: {
              id: session.id,
              timeRemaining: session.time_remaining,
              status: session.status,
              scores: {
                security: session.security_score || 0,
                architecture: session.architecture_score || 0,
                performance: session.performance_score || 0
              },
              testsPassed: session.tests_passed || 0,
              totalTests: session.total_tests || 24
            }
          });
        }
        
        // Session completed
        return NextResponse.json({
          success: true,
          isExisting: true,
          canContinue: false,
          message: 'You have already completed the challenge',
          candidate: candidate,
          session: {
            id: session.id,
            status: session.status,
            finalScore: session.final_score
          }
        });
      }
      
      // No session exists, create new one
      const newSession = await sql`
        INSERT INTO test_sessions (candidate_id, time_remaining, status)
        VALUES (${candidate.id}, 2700, 'in_progress')
        RETURNING id, started_at, time_remaining, status
      `;

      return NextResponse.json({
        success: true,
        isExisting: true,
        canContinue: true,
        candidate: candidate,
        session: {
          id: newSession[0].id,
          timeRemaining: newSession[0].time_remaining,
          status: newSession[0].status
        }
      });
    }

    // New candidate - requires name
    if (!name) {
      return NextResponse.json({
        success: false,
        isExisting: false,
        error: 'New candidate - name is required'
      }, { status: 400 });
    }

    // Create new candidate
    const newCandidate = await sql`
      INSERT INTO candidates (email, name, status)
      VALUES (${email}, ${name}, 'active')
      RETURNING id, email, name, created_at, status
    `;

    // Create new session
    const newSession = await sql`
      INSERT INTO test_sessions (candidate_id, time_remaining, status)
      VALUES (${newCandidate[0].id}, 2700, 'in_progress')
      RETURNING id, started_at, time_remaining, status
    `;

    return NextResponse.json({
      success: true,
      isExisting: false,
      canContinue: true,
      candidate: newCandidate[0],
      session: {
        id: newSession[0].id,
        timeRemaining: newSession[0].time_remaining,
        status: newSession[0].status
      }
    });

  } catch (error) {
    console.error('Candidate auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Check if email exists (for UI validation)
export async function GET(request: NextRequest) {
  try {
    const sql = getDatabase();
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const candidate = await sql`
      SELECT c.id, c.email, c.name, c.status,
             ts.id as session_id, ts.status as session_status, ts.time_remaining
      FROM candidates c
      LEFT JOIN test_sessions ts ON c.id = ts.candidate_id
      WHERE c.email = ${email}
      ORDER BY ts.started_at DESC
      LIMIT 1
    `;

    if (candidate.length > 0) {
      return NextResponse.json({
        exists: true,
        candidate: {
          id: candidate[0].id,
          email: candidate[0].email,
          name: candidate[0].name,
          status: candidate[0].status,
          hasActiveSession: candidate[0].session_status === 'in_progress',
          sessionId: candidate[0].session_id,
          timeRemaining: candidate[0].time_remaining
        }
      });
    }

    return NextResponse.json({ exists: false });

  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { error: 'Check failed', details: String(error) },
      { status: 500 }
    );
  }
}

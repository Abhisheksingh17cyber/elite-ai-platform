import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Save code snapshot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDatabase();
    const { id } = await params;
    const { code, language } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Save the code snapshot
    const snapshot = await sql`
      INSERT INTO code_snapshots (session_id, code, language)
      VALUES (${id}, ${code}, ${language || 'typescript'})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      snapshot: snapshot[0]
    });

  } catch (error) {
    console.error('Save code snapshot error:', error);
    return NextResponse.json(
      { error: 'Failed to save code snapshot', details: String(error) },
      { status: 500 }
    );
  }
}

// Get latest code for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDatabase();
    const { id } = await params;

    const snapshots = await sql`
      SELECT * FROM code_snapshots 
      WHERE session_id = ${id}
      ORDER BY timestamp DESC
      LIMIT 20
    `;

    return NextResponse.json({
      success: true,
      snapshots
    });

  } catch (error) {
    console.error('Get code snapshots error:', error);
    return NextResponse.json(
      { error: 'Failed to get code snapshots', details: String(error) },
      { status: 500 }
    );
  }
}

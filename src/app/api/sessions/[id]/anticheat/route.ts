import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

// Log anti-cheat event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDatabase();
    const { id } = await params;
    const { eventType, severity, details, metadata } = await request.json();

    if (!eventType || !severity) {
      return NextResponse.json(
        { error: 'Event type and severity are required' },
        { status: 400 }
      );
    }

    // Log the anti-cheat event
    const event = await sql`
      INSERT INTO anti_cheat_events (session_id, event_type, severity, details, metadata)
      VALUES (${id}, ${eventType}, ${severity}, ${details || ''}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;

    // Update session's updated_at timestamp
    await sql`
      UPDATE test_sessions 
      SET updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      event: event[0]
    });

  } catch (error) {
    console.error('Log anti-cheat event error:', error);
    return NextResponse.json(
      { error: 'Failed to log anti-cheat event', details: String(error) },
      { status: 500 }
    );
  }
}

// Get anti-cheat events for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDatabase();
    const { id } = await params;

    const events = await sql`
      SELECT * FROM anti_cheat_events 
      WHERE session_id = ${id}
      ORDER BY timestamp DESC
    `;

    return NextResponse.json({
      success: true,
      events
    });

  } catch (error) {
    console.error('Get anti-cheat events error:', error);
    return NextResponse.json(
      { error: 'Failed to get anti-cheat events', details: String(error) },
      { status: 500 }
    );
  }
}

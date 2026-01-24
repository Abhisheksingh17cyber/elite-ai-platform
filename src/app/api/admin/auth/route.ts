import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { createHash } from 'crypto';

// Lazy initialization of database connection
function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

// Admin login
export async function POST(request: NextRequest) {
  try {
    const sql = getDatabase();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const admin = await sql`
      SELECT id, email, name, role, created_at
      FROM admin_users 
      WHERE email = ${email} AND password_hash = ${passwordHash}
    `;

    if (admin.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await sql`
      UPDATE admin_users 
      SET last_login = NOW()
      WHERE id = ${admin[0].id}
    `;

    // Generate a simple session token (in production, use JWT)
    const sessionToken = createHash('sha256')
      .update(`${admin[0].id}-${Date.now()}-${Math.random()}`)
      .digest('hex');

    return NextResponse.json({
      success: true,
      admin: admin[0],
      token: sessionToken
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Verify admin session (for protected routes)
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

    const admin = await sql`
      SELECT id, email, name, role, created_at, last_login
      FROM admin_users 
      WHERE email = ${email}
    `;

    if (admin.length === 0) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: admin[0]
    });

  } catch (error) {
    console.error('Verify admin error:', error);
    return NextResponse.json(
      { error: 'Verification failed', details: String(error) },
      { status: 500 }
    );
  }
}

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { neon } from '@neondatabase/serverless';
import { createHash } from 'crypto';

function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(process.env.DATABASE_URL);
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

const handler = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Credentials Provider for Admin Login
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const sql = getDatabase();
          const passwordHash = hashPassword(credentials.password);

          const admin = await sql`
            SELECT id, email, name, role
            FROM admin_users 
            WHERE email = ${credentials.email} AND password_hash = ${passwordHash}
          `;

          if (admin.length > 0) {
            // Update last login
            try {
              await sql`
                UPDATE admin_users 
                SET last_login = NOW()
                WHERE id = ${admin[0].id}
              `;
            } catch (e) {
              console.log('Could not update last_login:', e);
            }

            return {
              id: admin[0].id,
              email: admin[0].email,
              name: admin[0].name,
              role: admin[0].role,
              isAdmin: true
            };
          }
          return null;
        } catch (error) {
          console.error('Admin auth error:', error);
          return null;
        }
      }
    }),
    // Credentials Provider for Candidate Email Login
    CredentialsProvider({
      id: 'candidate-login',
      name: 'Candidate Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          const sql = getDatabase();
          
          // Check if candidate exists
          let candidate = await sql`
            SELECT id, email, name
            FROM candidates 
            WHERE email = ${credentials.email}
          `;

          if (candidate.length === 0 && credentials.name) {
            // Create new candidate
            candidate = await sql`
              INSERT INTO candidates (email, name, status)
              VALUES (${credentials.email}, ${credentials.name}, 'active')
              RETURNING id, email, name
            `;
          }

          if (candidate.length > 0) {
            return {
              id: candidate[0].id,
              email: candidate[0].email,
              name: candidate[0].name,
              isAdmin: false
            };
          }
          return null;
        } catch (error) {
          console.error('Candidate auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in - create candidate if not exists
      if (account?.provider === 'google' && user.email) {
        try {
          const sql = getDatabase();
          
          // Check if candidate exists
          const existing = await sql`
            SELECT id FROM candidates WHERE email = ${user.email}
          `;

          if (existing.length === 0) {
            // Create new candidate from Google auth
            await sql`
              INSERT INTO candidates (email, name, status)
              VALUES (${user.email}, ${user.name || 'Google User'}, 'active')
            `;
          }
        } catch (error) {
          console.error('Google sign-in DB error:', error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin || false;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
});

export { handler as GET, handler as POST };

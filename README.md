# Elite AI-Architect Challenge Platform

A comprehensive coding challenge platform designed for top-tier developers. This platform tests multi-dimensional problem-solving skills including distributed systems, security, performance optimization, and cost management.

## Features

### Candidate Features
- 🎯 **Interactive Challenge Interface** - Timer, code editor, file explorer, and console
- ⏱️ **45-Minute Timed Challenge** - Anti-cheat timer with urgency indicators
- 🔐 **Security Trap Detection** - Automatically detects hardcoded API keys and SQL injection vulnerabilities
- 📊 **Real-time Scoring** - Security, Architecture, and Performance metrics
- 🎨 **Modern UI** - Framer Motion animations, Monaco Editor, and particle effects
- 📱 **Responsive Design** - Works on desktop and mobile devices

### Admin Features
- 👁️ **Live Monitoring Dashboard** - Watch candidates in real-time
- 📈 **Progress Tracking** - Monitor completion rates and scores
- 🔍 **Code Review** - View candidate code with one click
- 🚩 **Session Management** - Flag suspicious activity or terminate sessions
- 📊 **Statistics** - Pass rates, score distributions, active sessions

### Anti-Cheat System
- 🛡️ **Tab/Window Detection** - Detects when candidates switch tabs
- ⌨️ **DevTools Prevention** - Blocks F12 and Ctrl+Shift+I
- 📋 **Copy/Paste Blocking** - Prevents copying from external sources
- 🖱️ **Right-Click Prevention** - Disables context menu
- 📸 **Screenshot Detection** - Detects PrintScreen attempts
- ⏰ **Idle Detection** - Flags inactive sessions (3 min timeout)
- 🖥️ **Fullscreen Mode** - Enforced exam environment

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion
- **Database**: Neon PostgreSQL (serverless)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Admin Access

Navigate to `/admin` to access the admin dashboard.

**Admin Credentials:**
- Email: `abhiisingh240@gmail.com`
- Password: `admin123`

### Database Setup (Neon)

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string
4. Create `.env.local`:
   ```
   DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
   ```
5. **Auto-setup:** Visit `http://localhost:3000/setup` after starting dev server

   **OR Manual SQL:** Run this in Neon SQL Editor:

```sql
-- CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- TEST SESSIONS TABLE
CREATE TABLE IF NOT EXISTS test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    challenge_id VARCHAR(100) DEFAULT 'default',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    time_remaining INTEGER DEFAULT 2700,
    status VARCHAR(50) DEFAULT 'in_progress',
    final_score DECIMAL(5,2),
    security_score DECIMAL(5,2) DEFAULT 0,
    architecture_score DECIMAL(5,2) DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    tests_passed INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 24,
    current_file VARCHAR(255) DEFAULT 'main.py',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_candidate ON test_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON test_sessions(status);

-- CODE SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS code_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_session ON code_snapshots(session_id);

-- ANTI-CHEAT EVENTS TABLE
CREATE TABLE IF NOT EXISTS anti_cheat_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anticheat_session ON anti_cheat_events(session_id);
CREATE INDEX IF NOT EXISTS idx_anticheat_severity ON anti_cheat_events(severity);

-- ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

-- INSERT DEFAULT ADMIN (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
    'abhiisingh240@gmail.com',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    'Abhishek Singh',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;
```

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/db/init` | POST | Initialize database |
| `/api/candidates` | GET/POST | Manage candidates |
| `/api/sessions` | GET/POST | Test sessions |
| `/api/sessions/[id]` | GET/PATCH | Session details |
| `/api/sessions/[id]/code` | GET/POST | Code snapshots |
| `/api/sessions/[id]/anticheat` | GET/POST | Violations |
| `/api/admin/auth` | GET/POST | Admin login |
| `/api/admin/monitoring` | GET | Live data |

### Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/elite-ai-platform)

### Option 2: Manual Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Environment Variables** (if needed)
   - No environment variables required for basic functionality

### Option 3: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with dynamic import
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── MainLayout.tsx    # Main app shell
│   ├── Timer.tsx         # Challenge timer
│   ├── CodeEditor.tsx    # Monaco code editor
│   ├── FileExplorer.tsx  # File tree navigation
│   ├── Console.tsx       # Output console
│   ├── ActionButtons.tsx # Run/Test/Submit buttons
│   ├── ScorePanel.tsx    # Live scoring display
│   ├── Requirements.tsx  # Challenge requirements
│   ├── ChallengeOverview.tsx  # Landing page
│   └── EvaluationFramework.tsx # Scoring rubric
├── store/
│   └── challengeStore.ts # Zustand state management
├── lib/
│   └── utils.ts          # Utility functions & trap detection
└── hooks/
    └── useHydration.ts   # Hydration hook for SSR
```

## License

MIT License - feel free to use this for your own projects.

## Author

Built for the top 1% of developers.


# Elite AI-Architect Challenge Platform

A comprehensive coding challenge platform designed for top-tier developers. This platform tests multi-dimensional problem-solving skills including distributed systems, security, performance optimization, and cost management.

## Features

- 🎯 **Interactive Challenge Interface** - Timer, code editor, file explorer, and console
- ⏱️ **120-Minute Timed Challenge** - Anti-cheat timer with urgency indicators
- 🔐 **Security Trap Detection** - Automatically detects hardcoded API keys and SQL injection vulnerabilities
- 📊 **Real-time Scoring** - Security, Architecture, and Performance metrics
- 🎨 **Modern UI** - Framer Motion animations, Monaco Editor, and particle effects
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Code Editor**: Monaco Editor
- **Animations**: Framer Motion
- **Particles**: tsparticles
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


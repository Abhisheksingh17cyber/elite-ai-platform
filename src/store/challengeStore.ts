import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CHALLENGE_PROBLEMS, { getProblemById, ChallengeProblem } from '@/lib/challengeProblems';

export interface ChallengeState {
  // Session
  sessionId: string | null;
  candidateName: string;
  candidateEmail: string;

  // Challenge State
  currentProblemId: string;
  challengeStarted: boolean;
  challengeCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  timeRemaining: number;

  // Code State
  code: string;
  activeFile: string;
  files: Record<string, string>;

  // Scores
  securityScore: number;
  architectureScore: number;
  performanceScore: number;
  totalScore: number;
  testsPassed: number;
  totalTests: number;

  // Console
  consoleOutput: Array<{ type: 'info' | 'warning' | 'error' | 'success'; text: string; timestamp: number }>;

  // Trap Detection
  trapDetected: boolean;
  vulnerabilitiesFound: string[];

  // Actions
  setSession: (sessionId: string, name: string, email: string) => void;
  startChallenge: () => void;
  endChallenge: () => void;
  updateCode: (code: string) => void;
  setActiveFile: (file: string) => void;
  updateFile: (filename: string, content: string) => void;
  decrementTime: () => void;
  addConsoleOutput: (type: 'info' | 'warning' | 'error' | 'success', text: string) => void;
  clearConsole: () => void;
  updateScores: (security: number, architecture: number, performance: number) => void;
  setTestResults: (passed: number, total: number) => void;
  setTrapDetected: (detected: boolean) => void;
  addVulnerability: (vulnerability: string) => void;
  resetChallenge: () => void;
  clearSession: () => void;
  switchProblem: (problemId: string) => void;
}

const CHALLENGE_DURATION = 45 * 60; // 45 minutes in seconds

// Files utility
const getFilesForProblem = (problem: ChallengeProblem) => {
  const files: Record<string, string> = {
    'main.py': problem.solution.codeTemplate,
  };

  // Add helper files if they exist in the description or Hints (simulated here)
  // In a real app, these would be part of the problem definition
  if (problem.id === 'distributed-ai-system') {
    files['auth_service.py'] = `# Authentication Service - Currently INSECURE
# TODO: Implement proper authentication

class AuthService:
    def __init__(self):
        self.users = {}
        self.admin_password = "admin123"  # SECURITY ISSUE!
        
    def authenticate(self, username, password):
        # WARNING: No rate limiting, no password hashing
        if username == "admin" and password == self.admin_password:
            return {"role": "admin", "token": "static-token-123"}
        return None`;

    files['vector_cache.py'] = `# Vector Cache Service - Stub Implementation
# TODO: Implement semantic caching with Pinecone/Weaviate

class VectorCache:
    def __init__(self):
        self.cache = {}  # In-memory only - NOT DISTRIBUTED!
        
    def get_similar(self, query_embedding, threshold=0.95):
        # TODO: Implement actual vector similarity search
        return None`;

    files['load_balancer.py'] = `# Load Balancer - Single Region Only!
# TODO: Implement multi-region with failover

class LoadBalancer:
    def __init__(self):
        self.backends = ["http://localhost:8000"]  # Single backend!
        self.current = 0
        
    def get_backend(self):
        # Round-robin only - no health checks!
        backend = self.backends[self.current]
        self.current = (self.current + 1) % len(self.backends)
        return backend`;
  } else {
    // Basic setup for other problems
    const requirements = problem.requirements.map(r => `- ${r}`).join('\n');
    files['README.md'] = `# ${problem.title}

${problem.description}

## Requirements
${requirements}
`;
  }

  return files;
};

const initialProblem = CHALLENGE_PROBLEMS[0];
const initialFiles = getFilesForProblem(initialProblem);

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      // Initial State
      sessionId: null,
      candidateName: '',
      candidateEmail: '',
      currentProblemId: initialProblem.id,
      challengeStarted: false,
      challengeCompleted: false,
      startTime: null,
      endTime: null,
      timeRemaining: CHALLENGE_DURATION,
      code: initialFiles['main.py'],
      activeFile: 'main.py',
      files: initialFiles,
      securityScore: 0,
      architectureScore: 0,
      performanceScore: 0,
      totalScore: 0,
      testsPassed: 0,
      totalTests: 24,
      consoleOutput: [],
      trapDetected: false,
      vulnerabilitiesFound: [],

      // Actions
      setSession: (sessionId, name, email) => set({
        sessionId,
        candidateName: name,
        candidateEmail: email
      }),

      startChallenge: () => set({
        challengeStarted: true,
        startTime: Date.now(),
        timeRemaining: CHALLENGE_DURATION,
        consoleOutput: [{
          type: 'info',
          text: '🚀 Challenge started! You have 45 minutes. Good luck!',
          timestamp: Date.now()
        }]
      }),

      endChallenge: () => set({
        challengeCompleted: true,
        endTime: Date.now()
      }),

      updateCode: (code) => {
        const { activeFile, files } = get();
        set({
          code,
          files: { ...files, [activeFile]: code }
        });
      },

      setActiveFile: (file) => {
        const { files } = get();
        set({
          activeFile: file,
          code: files[file] || ''
        });
      },

      updateFile: (filename, content) => {
        const { files, activeFile } = get();
        const newFiles = { ...files, [filename]: content };
        set({
          files: newFiles,
          code: filename === activeFile ? content : get().code
        });
      },

      decrementTime: () => {
        const { timeRemaining, challengeStarted } = get();
        if (challengeStarted && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (timeRemaining === 0) {
          get().endChallenge();
        }
      },

      addConsoleOutput: (type, text) => set((state) => ({
        consoleOutput: [...state.consoleOutput, { type, text, timestamp: Date.now() }]
      })),

      clearConsole: () => set({ consoleOutput: [] }),

      updateScores: (security, architecture, performance) => set({
        securityScore: security,
        architectureScore: architecture,
        performanceScore: performance,
        totalScore: security + architecture + performance
      }),

      setTestResults: (passed, total) => set({
        testsPassed: passed,
        totalTests: total
      }),

      setTrapDetected: (detected) => set({ trapDetected: detected }),

      addVulnerability: (vulnerability) => set((state) => ({
        vulnerabilitiesFound: [...state.vulnerabilitiesFound, vulnerability]
      })),

      resetChallenge: () => set({
        challengeStarted: false,
        challengeCompleted: false,
        startTime: null,
        endTime: null,
        timeRemaining: CHALLENGE_DURATION,
        currentProblemId: initialProblem.id,
        code: initialFiles['main.py'],
        activeFile: 'main.py',
        files: initialFiles,
        securityScore: 0,
        architectureScore: 0,
        performanceScore: 0,
        totalScore: 0,
        testsPassed: 0,
        consoleOutput: [],
        trapDetected: false,
        vulnerabilitiesFound: []
      }),

      clearSession: () => set({
        sessionId: null,
        candidateName: '',
        candidateEmail: '',
        challengeStarted: false,
        challengeCompleted: false,
        startTime: null,
        endTime: null,
        timeRemaining: CHALLENGE_DURATION,
        currentProblemId: initialProblem.id,
        code: initialFiles['main.py'],
        activeFile: 'main.py',
        files: initialFiles,
        securityScore: 0,
        architectureScore: 0,
        performanceScore: 0,
        totalScore: 0,
        testsPassed: 0,
        consoleOutput: [],
        trapDetected: false,
        vulnerabilitiesFound: []
      }),

      switchProblem: (problemId: string) => {
        const problem = getProblemById(problemId);
        if (!problem) return;

        const newFiles = getFilesForProblem(problem);
        set({
          currentProblemId: problemId,
          files: newFiles,
          activeFile: 'main.py',
          code: newFiles['main.py'],
          // Reset progress on switch
          securityScore: 0,
          architectureScore: 0,
          performanceScore: 0,
          totalScore: 0,
          consoleOutput: [{
            type: 'warning',
            text: '⚠️ SYSTEM ALERT: Problem has been switched due to suspicious activity.',
            timestamp: Date.now()
          }]
        });
      }
    }),
    {
      name: 'elite-challenge-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        candidateName: state.candidateName,
        candidateEmail: state.candidateEmail,
        challengeStarted: state.challengeStarted,
        startTime: state.startTime,
        timeRemaining: state.timeRemaining,
        files: state.files,
        activeFile: state.activeFile,
        currentProblemId: state.currentProblemId
      })
    }
  )
);

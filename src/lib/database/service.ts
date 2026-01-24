'use client';

// Database service for syncing challenge data
// This service provides a clean interface for components to interact with the database

export interface SessionData {
  sessionId: string;
  candidateId: string;
  email: string;
  name: string;
}

// Initialize the database (call this once when app starts)
export async function initializeDatabase(): Promise<boolean> {
  try {
    const response = await fetch('/api/db/init', {
      method: 'POST'
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

// Register a candidate and start their session
export async function registerCandidate(email: string, name: string): Promise<SessionData | null> {
  try {
    const response = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const data = await response.json();
    
    if (data.success) {
      return {
        sessionId: data.session.id,
        candidateId: data.candidate.id,
        email: data.candidate.email,
        name: data.candidate.name
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to register candidate:', error);
    return null;
  }
}

// Get candidate by email
export async function getCandidateByEmail(email: string): Promise<SessionData | null> {
  try {
    const response = await fetch(`/api/candidates?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (data.success && data.candidate.session_id) {
      return {
        sessionId: data.candidate.session_id,
        candidateId: data.candidate.id,
        email: data.candidate.email,
        name: data.candidate.name
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get candidate:', error);
    return null;
  }
}

// Save code snapshot
export async function saveCodeSnapshot(sessionId: string, code: string, language: string = 'typescript'): Promise<boolean> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to save code snapshot:', error);
    return false;
  }
}

// Update session (time remaining, scores, status)
export async function updateSession(
  sessionId: string, 
  updates: {
    time_remaining?: number;
    status?: string;
    security_score?: number;
    architecture_score?: number;
    performance_score?: number;
    tests_passed?: number;
  }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to update session:', error);
    return false;
  }
}

// End session
export async function endSession(sessionId: string, status: 'completed' | 'terminated' = 'completed'): Promise<boolean> {
  return updateSession(sessionId, { status });
}

// Log anti-cheat violation
export async function logAntiCheatEvent(
  sessionId: string,
  eventType: string,
  severity: string,
  details: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/anticheat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, severity, details })
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to log anti-cheat event:', error);
    return false;
  }
}

// Debounced code sync (prevents too many API calls)
let codeSyncTimeout: NodeJS.Timeout | null = null;

export function debouncedCodeSync(sessionId: string, code: string, language: string = 'typescript', delay: number = 5000): void {
  if (codeSyncTimeout) {
    clearTimeout(codeSyncTimeout);
  }
  
  codeSyncTimeout = setTimeout(() => {
    saveCodeSnapshot(sessionId, code, language);
    codeSyncTimeout = null;
  }, delay);
}

// Time sync (update time remaining periodically)
export function startTimeSync(sessionId: string, getTimeRemaining: () => number, intervalMs: number = 30000): () => void {
  const interval = setInterval(() => {
    const timeRemaining = getTimeRemaining();
    updateSession(sessionId, { time_remaining: timeRemaining });
  }, intervalMs);
  
  return () => clearInterval(interval);
}

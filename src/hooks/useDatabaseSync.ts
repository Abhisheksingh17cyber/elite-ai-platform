'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { 
  saveCodeSnapshot, 
  updateSession, 
  endSession,
  registerCandidate 
} from '@/lib/database/service';

const CODE_SYNC_INTERVAL = 10000; // 10 seconds
const TIME_SYNC_INTERVAL = 30000; // 30 seconds

export function useDatabaseSync() {
  const { 
    sessionId,
    challengeStarted,
    challengeCompleted,
    code,
    activeFile,
    timeRemaining,
    securityScore,
    architectureScore,
    performanceScore,
    testsPassed,
    setSession
  } = useChallengeStore();

  const lastCodeRef = useRef<string>('');
  const lastSyncTimeRef = useRef<number | null>(null);
  
  // Initialize ref values after mount
  useEffect(() => {
    lastSyncTimeRef.current = Date.now();
  }, []);
  
  // Initialize session when candidate info is available
  const initializeSession = useCallback(async (email: string, name: string) => {
    const sessionData = await registerCandidate(email, name);
    if (sessionData) {
      setSession(sessionData.sessionId, sessionData.name, sessionData.email);
      return sessionData.sessionId;
    }
    return null;
  }, [setSession]);

  // Sync code to database
  useEffect(() => {
    if (!sessionId || !challengeStarted || challengeCompleted) return;

    const syncCode = async () => {
      // Only sync if code changed
      if (code !== lastCodeRef.current) {
        lastCodeRef.current = code;
        await saveCodeSnapshot(sessionId, code, getLanguageFromFile(activeFile));
      }
    };

    const interval = setInterval(syncCode, CODE_SYNC_INTERVAL);
    
    // Sync immediately when code changes significantly
    const timeout = setTimeout(() => {
      if (code !== lastCodeRef.current) {
        syncCode();
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [sessionId, challengeStarted, challengeCompleted, code, activeFile]);

  // Sync time and scores to database
  useEffect(() => {
    if (!sessionId || !challengeStarted || challengeCompleted) return;

    const syncSession = async () => {
      await updateSession(sessionId, {
        time_remaining: timeRemaining,
        security_score: securityScore,
        architecture_score: architectureScore,
        performance_score: performanceScore,
        tests_passed: testsPassed
      });
      lastSyncTimeRef.current = Date.now();
    };

    const interval = setInterval(syncSession, TIME_SYNC_INTERVAL);
    
    return () => clearInterval(interval);
  }, [sessionId, challengeStarted, challengeCompleted, timeRemaining, securityScore, architectureScore, performanceScore, testsPassed]);

  // Handle challenge completion
  useEffect(() => {
    if (!sessionId || !challengeCompleted) return;

    const completeSession = async () => {
      // Final sync of scores
      await updateSession(sessionId, {
        time_remaining: timeRemaining,
        security_score: securityScore,
        architecture_score: architectureScore,
        performance_score: performanceScore,
        tests_passed: testsPassed
      });
      
      // Save final code snapshot
      await saveCodeSnapshot(sessionId, code, getLanguageFromFile(activeFile));
      
      // Mark session as completed
      await endSession(sessionId, 'completed');
    };

    completeSession();
  }, [sessionId, challengeCompleted, timeRemaining, code, activeFile, securityScore, architectureScore, performanceScore, testsPassed]);

  // Sync before page unload
  useEffect(() => {
    if (!sessionId || !challengeStarted) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery
      const data = JSON.stringify({
        code,
        language: getLanguageFromFile(activeFile)
      });
      
      navigator.sendBeacon(`/api/sessions/${sessionId}/code`, data);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, challengeStarted, code, activeFile]);

  return {
    initializeSession,
    isConnected: !!sessionId
  };
}

function getLanguageFromFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'py': 'python',
    'ts': 'typescript',
    'tsx': 'typescriptreact',
    'js': 'javascript',
    'jsx': 'javascriptreact',
    'tf': 'hcl',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'md': 'markdown'
  };
  return languageMap[ext || ''] || 'plaintext';
}

export default useDatabaseSync;

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { getAlternateProblem } from '@/lib/challengeProblems';

export interface AntiCheatViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: string;
  metadata?: Record<string, unknown>;
}

interface AntiCheatConfig {
  enableTabDetection: boolean;
  enableCopyPasteBlock: boolean;
  enableDevToolsDetection: boolean;
  enableRightClickBlock: boolean;
  enableScreenshotDetection: boolean;
  enableIdleDetection: boolean;
  enableAIDetection: boolean;
  enableLargePasteDetection: boolean;
  idleTimeoutMs: number;
  maxTabSwitches: number;
  maxWarnings: number;
  largePasteThreshold: number; // Characters
  sessionId?: string;
}

const defaultConfig: AntiCheatConfig = {
  enableTabDetection: true,
  enableCopyPasteBlock: true,
  enableDevToolsDetection: true,
  enableRightClickBlock: true,
  enableScreenshotDetection: true,
  enableIdleDetection: true,
  enableAIDetection: true,
  enableLargePasteDetection: true,
  idleTimeoutMs: 180000, // 3 minutes
  maxTabSwitches: 3,
  maxWarnings: 5,
  largePasteThreshold: 50 // 50+ chars triggers detection
};

// AI-generated code patterns to detect
const AI_PATTERNS = [
  // Common AI response patterns
  /Sure,? here('s| is) (a |an |the )?(code|solution|implementation|example|function)/i,
  /I'll (help|assist|provide|create|write)/i,
  /Here('s| is) (how|what|the|a)/i,
  /Let me (explain|show|help|create|write)/i,
  /This (code|function|implementation) (will|does|can)/i,
  // AI-style comments
  /\/\/ (This|Here|The|Note|TODO|FIXME).*\n\/\/ /,
  /# (This|Here|The|Note) (function|class|method|code)/i,
  // Common AI variable naming patterns
  /(optimized|enhanced|improved|modular|scalable)_?(function|solution|implementation)/i,
  // Suspiciously perfect comments
  /\/\*\*\n \* @(param|returns|description|example)/,
  // AI boilerplate
  /\/\/ (Example|Usage|Implementation|Solution) (below|here|follows)/i,
  // ChatGPT/Claude specific patterns
  /Certainly!|Of course!|Absolutely!|Great question!/i,
  /```(python|javascript|typescript|java|cpp)/i,
];

// Patterns that indicate rapid typing (likely paste)
const PASTE_INDICATORS = {
  maxCharsPerSecond: 15, // Human max is ~10-12 chars/sec
  suspiciousChunkSize: 100, // Chars added in single event
};

// Log violation to database
async function logViolationToDatabase(sessionId: string, violation: AntiCheatViolation) {
  try {
    await fetch(`/api/sessions/${sessionId}/anticheat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: violation.type,
        severity: violation.severity,
        details: violation.details,
        metadata: { timestamp: violation.timestamp, ...violation.metadata }
      })
    });
  } catch (error) {
    console.error('Failed to log violation to database:', error);
  }
}

// Detect AI-generated code patterns
function detectAIPatterns(code: string): { isAI: boolean; patterns: string[] } {
  const detectedPatterns: string[] = [];

  for (const pattern of AI_PATTERNS) {
    if (pattern.test(code)) {
      detectedPatterns.push(pattern.source.substring(0, 30) + '...');
    }
  }

  // Check for suspiciously perfect code structure
  const lines = code.split('\n');
  const commentRatio = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('#')).length / lines.length;

  if (commentRatio > 0.3) {
    detectedPatterns.push('high_comment_ratio');
  }

  // Check for markdown code blocks (from AI copy-paste)
  if (/```[\w]*\n/.test(code)) {
    detectedPatterns.push('markdown_code_block');
  }

  return {
    isAI: detectedPatterns.length >= 2,
    patterns: detectedPatterns
  };
}

export function useAntiCheat(config: Partial<AntiCheatConfig> = {}) {
  const settings = { ...defaultConfig, ...config };
  const {
    challengeStarted,
    addConsoleOutput,
    code: currentCode,
    switchProblem,
    currentProblemId
  } = useChallengeStore();

  const [violations, setViolations] = useState<AntiCheatViolation[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [aiDetectionCount, setAiDetectionCount] = useState(0);
  const [largePasteCount, setLargePasteCount] = useState(0);

  const lastActivityRef = useRef<number | null>(null);
  const devToolsOpenRef = useRef(false);
  const lastCodeRef = useRef<string>('');
  const lastCodeTimeRef = useRef<number>(Date.now());
  const typingSpeedRef = useRef<number[]>([]);

  useEffect(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const handleCheatingPenalty = useCallback(() => {
    // If violations are critical or frequent, switch to a harder problem
    const shouldSwitch = violations.some(v => v.severity === 'critical') || violations.length >= 5;

    if (shouldSwitch && currentProblemId) {
      const altProblem = getAlternateProblem(currentProblemId);
      if (altProblem && altProblem.id !== currentProblemId) {
        switchProblem(altProblem.id);

        // Also add a system message
        addConsoleOutput('error', '🚨 CRITICAL: Suspicious activity confirmed. Problem context has been rotated.');
      }
    }
  }, [violations, currentProblemId, switchProblem, addConsoleOutput]);

  const logViolation = useCallback((violation: AntiCheatViolation) => {
    setViolations(prev => {
      const newViolations = [...prev, violation];
      // Check for penalty triggered by this new violation
      const critical = newViolations.some(v => v.severity === 'critical');
      const tooMany = newViolations.length >= settings.maxWarnings;

      if (critical || tooMany) {
        // We can't call handleCheatingPenalty directly here due to state update cycles, 
        // but we can trigger it or let the effect handle it.
        // Actually, let's just trigger the switch logic in a separate effect dependent on violations.
      }
      return newViolations;
    });

    const severityEmoji = {
      low: '⚠️',
      medium: '🟡',
      high: '🔴',
      critical: '🚨'
    };

    addConsoleOutput(
      violation.severity === 'critical' ? 'error' : 'warning',
      `${severityEmoji[violation.severity]} Anti-Cheat: ${violation.details}`
    );

    if (settings.sessionId) {
      logViolationToDatabase(settings.sessionId, violation);
    }

    if (typeof window !== 'undefined') {
      console.warn('[Anti-Cheat]', violation);
    }
  }, [addConsoleOutput, settings.sessionId, settings.maxWarnings]);

  // Effect to handle penalties when violations change
  useEffect(() => {
    const critical = violations.some(v => v.severity === 'critical');
    const tooMany = violations.length >= settings.maxWarnings;

    if ((critical || tooMany) && currentProblemId) {
      // Debounce slightly to avoid rapid switching or React loops
      const timer = setTimeout(() => {
        const altProblem = getAlternateProblem(currentProblemId);
        if (altProblem && altProblem.id !== currentProblemId) {
          // Only switch if we haven't already switched to this one (though store handles that reset)
          // Ideally we check if we already switched, but for now this is the "trap"
          switchProblem(altProblem.id);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [violations, currentProblemId, settings.maxWarnings, switchProblem]);

  // Tab/Window Focus Detection
  useEffect(() => {
    if (!challengeStarted || !settings.enableTabDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          logViolation({
            type: 'tab_switch',
            severity: newCount >= settings.maxTabSwitches ? 'high' : 'medium',
            timestamp: Date.now(),
            details: `Tab switch detected (${newCount}/${settings.maxTabSwitches} allowed)`,
            metadata: { count: newCount }
          });
          return newCount;
        });
      }
    };

    const handleWindowBlur = () => {
      logViolation({
        type: 'window_blur',
        severity: 'medium',
        timestamp: Date.now(),
        details: 'Window lost focus - possible external application access'
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [challengeStarted, settings.enableTabDetection, settings.maxTabSwitches, logViolation]);

  // Enhanced Copy/Paste Detection with Large Paste Monitoring
  useEffect(() => {
    if (!challengeStarted || !settings.enableCopyPasteBlock) return;

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.monaco-editor')) return;

      e.preventDefault();
      logViolation({
        type: 'copy_attempt',
        severity: 'medium',
        timestamp: Date.now(),
        details: 'Copy attempt blocked outside code editor'
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const pastedText = e.clipboardData?.getData('text') || '';

      // Allow small pastes in code editor
      if (target.closest('.monaco-editor')) {
        // Check for large paste
        if (settings.enableLargePasteDetection && pastedText.length > settings.largePasteThreshold) {
          setLargePasteCount(prev => prev + 1);

          // Check for AI patterns in pasted content
          const aiCheck = detectAIPatterns(pastedText);

          logViolation({
            type: 'large_paste',
            severity: aiCheck.isAI ? 'critical' : 'high',
            timestamp: Date.now(),
            details: `Large paste detected: ${pastedText.length} characters${aiCheck.isAI ? ' - POSSIBLE AI-GENERATED CODE' : ''}`,
            metadata: {
              charCount: pastedText.length,
              possibleAI: aiCheck.isAI,
              aiPatterns: aiCheck.patterns,
              preview: pastedText.substring(0, 100)
            }
          });

          if (aiCheck.isAI) {
            setAiDetectionCount(prev => prev + 1);
          }
        }
        return; // Allow the paste
      }

      e.preventDefault();
      logViolation({
        type: 'paste_attempt',
        severity: 'high',
        timestamp: Date.now(),
        details: 'Paste attempt blocked - possible external content injection'
      });
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [challengeStarted, settings.enableCopyPasteBlock, settings.enableLargePasteDetection, settings.largePasteThreshold, logViolation]);

  // AI-Generated Code Detection on Code Changes
  useEffect(() => {
    if (!challengeStarted || !settings.enableAIDetection || !currentCode) return;

    const now = Date.now();
    const timeDiff = now - lastCodeTimeRef.current;
    const charDiff = currentCode.length - lastCodeRef.current.length;

    // Calculate typing speed
    if (timeDiff > 0 && charDiff > 0) {
      const charsPerSecond = (charDiff / timeDiff) * 1000;
      typingSpeedRef.current.push(charsPerSecond);

      // Keep last 10 measurements
      if (typingSpeedRef.current.length > 10) {
        typingSpeedRef.current.shift();
      }

      // Check for suspiciously fast typing (likely paste)
      if (charsPerSecond > PASTE_INDICATORS.maxCharsPerSecond && charDiff > PASTE_INDICATORS.suspiciousChunkSize) {
        logViolation({
          type: 'rapid_input',
          severity: 'medium',
          timestamp: now,
          details: `Rapid text input detected: ${Math.round(charsPerSecond)} chars/sec (${charDiff} characters)`,
          metadata: { charsPerSecond, charCount: charDiff }
        });
      }
    }

    // Periodic AI pattern check (every 30 seconds worth of changes)
    if (currentCode.length > lastCodeRef.current.length + 200) {
      const aiCheck = detectAIPatterns(currentCode);

      if (aiCheck.isAI && aiCheck.patterns.length > 0) {
        logViolation({
          type: 'ai_pattern_detected',
          severity: 'high',
          timestamp: now,
          details: `AI-generated code patterns detected: ${aiCheck.patterns.join(', ')}`,
          metadata: { patterns: aiCheck.patterns }
        });
        setAiDetectionCount(prev => prev + 1);
      }
    }

    lastCodeRef.current = currentCode;
    lastCodeTimeRef.current = now;
  }, [currentCode, challengeStarted, settings.enableAIDetection, logViolation]);

  // DevTools Detection
  useEffect(() => {
    if (!challengeStarted || !settings.enableDevToolsDetection) return;

    const threshold = 160;

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !devToolsOpenRef.current) {
        devToolsOpenRef.current = true;
        logViolation({
          type: 'devtools_open',
          severity: 'critical',
          timestamp: Date.now(),
          details: 'Developer tools detected - this is a critical violation'
        });
      } else if (!widthThreshold && !heightThreshold) {
        devToolsOpenRef.current = false;
      }
    };

    const checkInterval = setInterval(detectDevTools, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        logViolation({
          type: 'keyboard_shortcut',
          severity: 'high',
          timestamp: Date.now(),
          details: `Blocked shortcut: ${e.key} - DevTools access attempt`
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [challengeStarted, settings.enableDevToolsDetection, logViolation]);

  // Right Click Prevention
  useEffect(() => {
    if (!challengeStarted || !settings.enableRightClickBlock) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.monaco-editor')) return;

      e.preventDefault();
      logViolation({
        type: 'right_click',
        severity: 'low',
        timestamp: Date.now(),
        details: 'Right-click menu blocked'
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [challengeStarted, settings.enableRightClickBlock, logViolation]);

  // Screenshot Detection
  useEffect(() => {
    if (!challengeStarted || !settings.enableScreenshotDetection) return;

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        logViolation({
          type: 'screenshot_attempt',
          severity: 'critical',
          timestamp: Date.now(),
          details: 'Screenshot attempt detected via PrintScreen key'
        });

        if (navigator.clipboard) {
          navigator.clipboard.writeText('Screenshot blocked by Elite Challenge anti-cheat system');
        }
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [challengeStarted, settings.enableScreenshotDetection, logViolation]);

  // Idle Detection
  useEffect(() => {
    if (!challengeStarted || !settings.enableIdleDetection) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const checkIdle = () => {
      if (lastActivityRef.current === null) return;
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime > settings.idleTimeoutMs) {
        logViolation({
          type: 'idle_too_long',
          severity: 'medium',
          timestamp: Date.now(),
          details: `Idle for ${Math.floor(idleTime / 60000)} minutes - possible away from test`
        });
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => document.addEventListener(event, updateActivity));

    const idleInterval = setInterval(checkIdle, 30000);

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity));
      clearInterval(idleInterval);
    };
  }, [challengeStarted, settings.enableIdleDetection, settings.idleTimeoutMs, logViolation]);

  // Full Screen Request
  const requestFullScreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        addConsoleOutput('warning', 'Could not enter fullscreen mode');
      });
    }
  }, [addConsoleOutput]);

  const getViolations = useCallback(() => violations, [violations]);
  const getViolationCount = useCallback(() => violations.length, [violations]);
  const getCriticalViolations = useCallback(() =>
    violations.filter(v => v.severity === 'critical' || v.severity === 'high'),
    [violations]
  );

  const getAISuspicionLevel = useCallback(() => {
    if (aiDetectionCount >= 3) return 'high';
    if (aiDetectionCount >= 1) return 'medium';
    return 'low';
  }, [aiDetectionCount]);

  return {
    violations,
    getViolations,
    getViolationCount,
    getCriticalViolations,
    requestFullScreen,
    tabSwitchCount,
    largePasteCount,
    aiDetectionCount,
    getAISuspicionLevel,
    isExamMode: challengeStarted
  };
}

export default useAntiCheat;

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useChallengeStore } from '@/store/challengeStore';

export interface AntiCheatViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  details: string;
}

interface AntiCheatConfig {
  enableTabDetection: boolean;
  enableCopyPasteBlock: boolean;
  enableDevToolsDetection: boolean;
  enableRightClickBlock: boolean;
  enableScreenshotDetection: boolean;
  enableIdleDetection: boolean;
  idleTimeoutMs: number;
  maxTabSwitches: number;
  maxWarnings: number;
}

const defaultConfig: AntiCheatConfig = {
  enableTabDetection: true,
  enableCopyPasteBlock: true,
  enableDevToolsDetection: true,
  enableRightClickBlock: true,
  enableScreenshotDetection: true,
  enableIdleDetection: true,
  idleTimeoutMs: 180000, // 3 minutes
  maxTabSwitches: 3,
  maxWarnings: 5
};

export function useAntiCheat(config: Partial<AntiCheatConfig> = {}) {
  const settings = { ...defaultConfig, ...config };
  const { challengeStarted, addConsoleOutput } = useChallengeStore();
  
  const violationsRef = useRef<AntiCheatViolation[]>([]);
  const tabSwitchCountRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const devToolsOpenRef = useRef(false);

  const logViolation = useCallback((violation: AntiCheatViolation) => {
    violationsRef.current.push(violation);
    
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

    // Send to server for logging
    if (typeof window !== 'undefined') {
      // Could send to API here
      console.warn('[Anti-Cheat]', violation);
    }

    return violationsRef.current.length;
  }, [addConsoleOutput]);

  // Tab/Window Focus Detection
  useEffect(() => {
    if (!challengeStarted || !settings.enableTabDetection) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current++;
        const count = tabSwitchCountRef.current;
        
        logViolation({
          type: 'tab_switch',
          severity: count >= settings.maxTabSwitches ? 'high' : 'medium',
          timestamp: Date.now(),
          details: `Tab switch detected (${count}/${settings.maxTabSwitches} allowed)`
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

  // Copy/Paste Prevention
  useEffect(() => {
    if (!challengeStarted || !settings.enableCopyPasteBlock) return;

    const handleCopy = (e: ClipboardEvent) => {
      // Allow copy within code editor
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
      // Allow paste within code editor
      const target = e.target as HTMLElement;
      if (target.closest('.monaco-editor')) return;

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
  }, [challengeStarted, settings.enableCopyPasteBlock, logViolation]);

  // DevTools Detection
  useEffect(() => {
    if (!challengeStarted || !settings.enableDevToolsDetection) return;

    const threshold = 160;
    let checkInterval: NodeJS.Timeout;

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

    // Check periodically
    checkInterval = setInterval(detectDevTools, 1000);

    // Keyboard shortcut detection
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
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
      // Allow in code editor for features
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

  // Screenshot Detection (Print Screen)
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
        
        // Try to clear clipboard
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
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime > settings.idleTimeoutMs) {
        logViolation({
          type: 'idle_too_long',
          severity: 'medium',
          timestamp: Date.now(),
          details: `Idle for ${Math.floor(idleTime / 60000)} minutes - possible away from test`
        });
        lastActivityRef.current = Date.now(); // Reset to avoid spam
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => document.addEventListener(event, updateActivity));

    const idleInterval = setInterval(checkIdle, 30000); // Check every 30 seconds

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity));
      clearInterval(idleInterval);
    };
  }, [challengeStarted, settings.enableIdleDetection, settings.idleTimeoutMs, logViolation]);

  // Full Screen Request for Exam Mode
  const requestFullScreen = useCallback(() => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        addConsoleOutput('warning', 'Could not enter fullscreen mode');
      });
    }
  }, [addConsoleOutput]);

  // Get current violation count
  const getViolations = useCallback(() => {
    return violationsRef.current;
  }, []);

  const getViolationCount = useCallback(() => {
    return violationsRef.current.length;
  }, []);

  const getCriticalViolations = useCallback(() => {
    return violationsRef.current.filter(v => v.severity === 'critical' || v.severity === 'high');
  }, []);

  return {
    violations: violationsRef.current,
    getViolations,
    getViolationCount,
    getCriticalViolations,
    requestFullScreen,
    tabSwitchCount: tabSwitchCountRef.current,
    isExamMode: challengeStarted
  };
}

export default useAntiCheat;

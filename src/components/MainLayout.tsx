'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Code,
  ClipboardCheck,
  Menu,
  X,
  Shield,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { cn } from '@/lib/utils';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { useDatabaseSync } from '@/hooks/useDatabaseSync';

import Timer from './Timer';
import ChallengeOverview from './ChallengeOverview';
import CodeEditor from './CodeEditor';
import FileExplorer from './FileExplorer';
import Console from './Console';
import ActionButtons from './ActionButtons';
import ScorePanel from './ScorePanel';
import Requirements from './Requirements';
import EvaluationFramework from './EvaluationFramework';

type TabType = 'overview' | 'coding' | 'evaluation';

// Define tabs - evaluation only visible before challenge starts (for admins only later)
const getVisibleTabs = (challengeStarted: boolean) => {
  const allTabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'coding', label: 'Coding Environment', icon: Code },
  ];

  // Only show evaluation tab before challenge starts (candidates shouldn't see scores during test)
  if (!challengeStarted) {
    allTabs.push({ id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck });
  }

  return allTabs;
};

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const { challengeStarted, sessionId, candidateEmail, timeRemaining, files, endChallenge, addConsoleOutput } = useChallengeStore();

  // Database sync - syncs code and session data to Neon database
  useDatabaseSync();

  // Anti-cheat system - only active when challenge is started
  const { violations, tabSwitchCount, requestFullScreen } = useAntiCheat({
    enableTabDetection: challengeStarted,
    enableCopyPasteBlock: challengeStarted,
    enableDevToolsDetection: challengeStarted,
    enableRightClickBlock: challengeStarted,
    enableScreenshotDetection: challengeStarted,
    enableIdleDetection: challengeStarted,
    sessionId: sessionId || undefined, // Pass session ID for database logging
  });

  const warningsRemaining = 5 - Math.min(5, violations.length);

  // Track previous violations count for comparison
  const prevViolationsCount = useRef(0);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Show warning modal when new violations occur
  useEffect(() => {
    if (violations.length > prevViolationsCount.current && challengeStarted) {
      // Defer the state update to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setShowWarningModal(true);
      }, 0);
      return () => clearTimeout(timer);
    }
    prevViolationsCount.current = violations.length;
  }, [violations.length, challengeStarted]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (challengeStarted && timeRemaining === 0 && sessionId && !isTerminated) {
      const autoSubmit = async () => {
        addConsoleOutput('warning', '⏰ Time is up! Auto-submitting your code...');

        try {
          // Save final code
          await fetch(`/api/sessions/${sessionId}/code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: JSON.stringify(files), language: 'python' })
          });

          // Mark session as completed
          await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed', time_remaining: 0 })
          });

          addConsoleOutput('success', '✅ Code auto-submitted successfully!');
          endChallenge();
        } catch (error) {
          console.error('Auto-submit error:', error);
          addConsoleOutput('error', '❌ Auto-submit failed');
        }
      };

      autoSubmit();
    }
  }, [challengeStarted, timeRemaining, sessionId, files, endChallenge, addConsoleOutput, isTerminated]);

  // Terminate test on critical cheating (5+ violations or 3+ tab switches)
  useEffect(() => {
    if (!challengeStarted || !sessionId || isTerminated) return;

    const criticalViolations = violations.filter(v => v.severity === 'critical' || v.severity === 'high');

    if (criticalViolations.length >= 3 || tabSwitchCount >= 3 || violations.length >= 5) {
      const terminateSession = async () => {
        setIsTerminated(true);
        addConsoleOutput('error', '🚨 TEST TERMINATED: Multiple cheating violations detected');
        addConsoleOutput('error', `   Critical violations: ${criticalViolations.length}`);
        addConsoleOutput('error', `   Tab switches: ${tabSwitchCount}`);
        addConsoleOutput('error', `   Total violations: ${violations.length}`);

        try {
          // Log termination event
          await fetch(`/api/sessions/${sessionId}/anticheat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'test_terminated',
              severity: 'critical',
              details: 'Test terminated due to multiple cheating violations',
              metadata: {
                criticalViolations: criticalViolations.length,
                tabSwitches: tabSwitchCount,
                totalViolations: violations.length
              }
            })
          });

          // Mark session as terminated
          await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'terminated' })
          });

          endChallenge();
        } catch (error) {
          console.error('Termination error:', error);
        }
      };

      terminateSession();
    }
  }, [violations, tabSwitchCount, challengeStarted, sessionId, endChallenge, addConsoleOutput, isTerminated]);

  // Use requestAnimationFrame to defer hydration state update
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading Elite Challenge Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#080b12] text-white",
      challengeStarted && "exam-mode"
    )}>
      {/* Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#12121a] border border-red-500/30 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Security Warning</h3>
                  <p className="text-sm text-red-400">Anti-cheat violation detected</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Suspicious activity has been detected. You have {warningsRemaining} warning(s) remaining.
                {tabSwitchCount > 0 && ` Tab switches: ${tabSwitchCount}/3.`}
                Further violations may result in test termination.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  I Understand
                </button>
                {!isFullscreen && (
                  <button
                    onClick={() => {
                      requestFullScreen();
                      setShowWarningModal(false);
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Enter Fullscreen
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Termination Modal */}
      <AnimatePresence>
        {isTerminated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-100 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#12121a] border border-red-500/50 rounded-2xl p-8 max-w-lg w-full text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">Test Terminated</h2>
              <p className="text-gray-400 mb-6">
                Your test has been terminated due to multiple anti-cheat violations.
                This incident has been logged and reported.
              </p>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-medium mb-2">Violations detected:</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Tab switches: {tabSwitchCount}/3</li>
                  <li>• Critical violations: {violations.filter(v => v.severity === 'critical' || v.severity === 'high').length}</li>
                  <li>• Total violations: {violations.length}</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Exit
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Banner (when challenge is active) */}
      {challengeStarted && (
        <div className="bg-gradient-to-r from-[#0d1525] via-[#0f1729] to-[#0d1525] border-b border-[#4f8ff7]/20 px-3 sm:px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-[#4f8ff7]" />
              <span className="text-[#4f8ff7]/90 font-medium">Secure Exam Mode Active</span>
              {isFullscreen && (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full font-medium">
                  Fullscreen
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-[10px] sm:text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Monitored Session
              </span>
              {warningsRemaining < 5 && (
                <span className="text-amber-400 font-medium">
                  Warnings: {warningsRemaining}/5
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#080b12]/95 backdrop-blur-xl border-b border-[#21262d]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#4f8ff7] to-[#2563eb] rounded-xl flex items-center justify-center shadow-lg shadow-[#4f8ff7]/20">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Elite AI-Architect</h1>
                <p className="text-xs text-gray-500">Challenge Platform</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {getVisibleTabs(challengeStarted).map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#4f8ff7] to-[#2563eb] text-white shadow-lg shadow-[#4f8ff7]/20"
                      : "text-gray-400 hover:text-white hover:bg-[#151b26]"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>

            {/* Timer (when challenge started) */}
            {challengeStarted && (
              <div className="hidden md:block">
                <Timer />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#1a1a24] rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Timer */}
          {challengeStarted && (
            <div className="md:hidden mt-4">
              <Timer />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[#27272a] overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {getVisibleTabs(challengeStarted).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all",
                      activeTab === tab.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#1a1a24]"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChallengeOverview />
            </motion.div>
          )}

          {activeTab === 'coding' && (
            <motion.div
              key="coding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Action Buttons - Always shown when challenge is active */}
              {challengeStarted && <ActionButtons />}

              {/* Main Coding Area */}
              <div className="grid grid-cols-12 gap-4">
                {/* File Explorer */}
                <div className="col-span-12 md:col-span-2">
                  <FileExplorer />
                </div>

                {/* Code Editor - Full width during challenge */}
                <div className={cn(
                  "col-span-12",
                  challengeStarted ? "md:col-span-10" : "md:col-span-7"
                )}>
                  <CodeEditor height="600px" />
                </div>

                {/* Side Panel - Hidden during active challenge to prevent candidates seeing scores */}
                {!challengeStarted && (
                  <div className="col-span-12 md:col-span-3 space-y-4">
                    <ScorePanel />
                    <Console />
                  </div>
                )}
              </div>

              {/* Console during challenge - just the console, no scores */}
              {challengeStarted && (
                <div className="max-w-2xl">
                  <Console />
                </div>
              )}

              {/* Requirements - Hidden during challenge */}
              {!challengeStarted && <Requirements />}

              {/* Pro Tip - Hidden during challenge */}
              {!challengeStarted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-xl"
                >
                  <p className="font-bold text-blue-400 mb-2">💡 Pro Tip: GitHub Classroom Integration</p>
                  <p className="text-sm text-blue-200/80">
                    Click &quot;GitHub Classroom&quot; to get a pre-configured environment with Docker, Terraform,
                    and all dependencies. Your commits are automatically evaluated in real-time.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'evaluation' && !challengeStarted && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <EvaluationFramework />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 Elite AI-Architect Challenge. Built for the top 1%.</p>
        </div>
      </footer>
    </div>
  );
}

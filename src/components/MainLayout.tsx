'use client';

import { useState, useEffect } from 'react';
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

const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'coding', label: 'Coding Environment', icon: Code },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
];

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { challengeStarted } = useChallengeStore();

  // Anti-cheat system - only active when challenge is started
  const { violations, tabSwitchCount, requestFullScreen } = useAntiCheat({
    enableTabDetection: challengeStarted,
    enableCopyPasteBlock: challengeStarted,
    enableDevToolsDetection: challengeStarted,
    enableRightClickBlock: challengeStarted,
    enableScreenshotDetection: challengeStarted,
    enableIdleDetection: challengeStarted,
  });
  
  const warningsRemaining = 5 - Math.min(5, violations.length);
  
  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Show warning modal on new violations
  useEffect(() => {
    if (violations.length > 0 && challengeStarted) {
      setShowWarningModal(true);
    }
  }, [violations.length, challengeStarted]);

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
      "min-h-screen bg-[#0a0a0f] text-white",
      challengeStarted && "exam-mode"
    )}>
      {/* Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
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

      {/* Security Banner (when challenge is active) */}
      {challengeStarted && (
        <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-b border-blue-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300">Secure Exam Mode Active</span>
              {isFullscreen && (
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded-full">
                  Fullscreen
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Monitored Session
              </span>
              {warningsRemaining < 5 && (
                <span className="text-yellow-400">
                  Warnings: {warningsRemaining}/5
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Elite AI-Architect</h1>
                <p className="text-xs text-gray-500">Challenge Platform</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a24]"
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
                {tabs.map((tab) => (
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
      <main className="max-w-7xl mx-auto px-4 py-8">
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
              {/* Action Buttons */}
              <ActionButtons />

              {/* Main Coding Area */}
              <div className="grid grid-cols-12 gap-4">
                {/* File Explorer */}
                <div className="col-span-12 md:col-span-2">
                  <FileExplorer />
                </div>

                {/* Code Editor */}
                <div className="col-span-12 md:col-span-7">
                  <CodeEditor height="600px" />
                </div>

                {/* Side Panel */}
                <div className="col-span-12 md:col-span-3 space-y-4">
                  <ScorePanel />
                  <Console />
                </div>
              </div>

              {/* Requirements */}
              <Requirements />

              {/* Pro Tip */}
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
            </motion.div>
          )}

          {activeTab === 'evaluation' && (
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

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Code, 
  ClipboardCheck,
  Menu,
  X
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { cn } from '@/lib/utils';

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
  const { challengeStarted } = useChallengeStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading Elite Challenge Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Elite AI-Architect</h1>
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
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
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
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
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
              className="md:hidden border-t border-gray-800 overflow-hidden"
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
                        ? "bg-purple-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
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
                className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-xl"
              >
                <p className="font-bold text-yellow-400 mb-2">💡 Pro Tip: GitHub Classroom Integration</p>
                <p className="text-sm text-yellow-200/80">
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
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 Elite AI-Architect Challenge. Built for the top 1%.</p>
        </div>
      </footer>
    </div>
  );
}

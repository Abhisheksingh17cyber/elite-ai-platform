'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  X, 
  AlertTriangle, 
  Monitor, 
  Clock,
  Shield,
  Activity,
  Eye,
  Copy,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CodeSnapshot {
  id: string;
  timestamp: Date;
  code: string;
  challengeId: string;
}

interface LiveViewerProps {
  candidateId: string;
  candidateName: string;
  sessionId: string;
  onClose: () => void;
}

export default function LiveCodeViewer({ 
  candidateName, 
  sessionId, 
  onClose 
}: LiveViewerProps) {
  // Generate initial mock code
  const initialCode = `// Elite AI Challenge - ${candidateName}
// Session: ${sessionId}

function solveProblem(input: number[]): number {
  // Candidate's solution in progress...
  let result = 0;
  
  for (let i = 0; i < input.length; i++) {
    result += input[i];
  }
  
  return result;
}

// Test cases
console.log(solveProblem([1, 2, 3, 4, 5])); // Expected: 15
`;
  
  const [currentCode, setCurrentCode] = useState<string>(initialCode);
  const [snapshots, setSnapshots] = useState<CodeSnapshot[]>([]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [antiCheatEvents, setAntiCheatEvents] = useState<Array<{ type: string; timestamp: Date; severity: string }>>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  
  // Simulate real-time code updates
  useEffect(() => {
    // Simulate code updates
    const updateInterval = setInterval(() => {
      if (isLive) {
        // Simulate typing by adding a character
        setCurrentCode(prev => prev + '\n// Typing...');
      }
    }, 5000);
    
    // Simulate anti-cheat events
    const eventsInterval = setInterval(() => {
      const events = [
        { type: 'Tab Switch', severity: 'warning' },
        { type: 'Window Blur', severity: 'info' },
        { type: 'DevTools Attempt', severity: 'critical' },
        { type: 'Copy Attempt', severity: 'warning' },
      ];
      
      if (Math.random() > 0.7) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        setAntiCheatEvents(prev => [{
          ...randomEvent,
          timestamp: new Date()
        }, ...prev.slice(0, 9)]);
      }
    }, 8000);
    
    // Create snapshots
    const snapshotInterval = setInterval(() => {
      setSnapshots(prev => [{
        id: `snap-${Date.now()}`,
        timestamp: new Date(),
        code: currentCode,
        challengeId: 'challenge-1'
      }, ...prev.slice(0, 19)]);
    }, 30000);
    
    return () => {
      clearInterval(updateInterval);
      clearInterval(eventsInterval);
      clearInterval(snapshotInterval);
    };
  }, [candidateName, sessionId, isLive, currentCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(currentCode);
  };

  const navigateSnapshot = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentSnapshotIndex < snapshots.length - 1) {
      setCurrentSnapshotIndex(prev => prev + 1);
      setIsLive(false);
    } else if (direction === 'next') {
      if (currentSnapshotIndex > 0) {
        setCurrentSnapshotIndex(prev => prev - 1);
      } else {
        setIsLive(true);
      }
    }
  };

  const goLive = () => {
    setIsLive(true);
    setCurrentSnapshotIndex(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center ${
          isFullscreen ? 'p-0' : 'p-4'
        }`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`bg-[#0a0a0f] border border-[#27272a] rounded-2xl overflow-hidden ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-[#12121a] border-b border-[#27272a]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{candidateName}</h2>
                  <p className="text-sm text-gray-500">Session: {sessionId.slice(0, 8)}...</p>
                </div>
              </div>
              
              {/* Live indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isLive ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-500/10 border border-gray-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className={`text-sm font-medium ${isLive ? 'text-green-400' : 'text-gray-400'}`}>
                  {isLive ? 'LIVE' : 'PLAYBACK'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a24] rounded-lg transition-colors"
                title="Copy code"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a24] rounded-lg transition-colors"
                title="Toggle fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(100%-64px)]">
            {/* Code Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Code Header */}
              <div className="flex items-center justify-between p-3 bg-[#0d0d12] border-b border-[#27272a]">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">solution.ts</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateSnapshot('prev')}
                    disabled={snapshots.length === 0 || currentSnapshotIndex >= snapshots.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {!isLive && (
                    <button
                      onClick={goLive}
                      className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 border border-green-500/30 rounded"
                    >
                      Go Live
                    </button>
                  )}
                  <button
                    onClick={() => navigateSnapshot('next')}
                    disabled={isLive}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Code Content */}
              <div className="flex-1 overflow-auto p-4 bg-[#0a0a0f]">
                <pre
                  ref={codeRef}
                  className="font-mono text-sm text-gray-300 whitespace-pre-wrap"
                >
                  <code>{currentCode}</code>
                </pre>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-[#27272a] flex flex-col bg-[#0d0d12]">
              {/* Status */}
              <div className="p-4 border-b border-[#27272a]">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Session Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Time Elapsed</span>
                    <span className="text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      24:35
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Challenges</span>
                    <span className="text-white">2/5 Complete</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Current Score</span>
                    <span className="text-green-400">180 pts</span>
                  </div>
                </div>
              </div>

              {/* Anti-Cheat Events */}
              <div className="flex-1 overflow-auto p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Anti-Cheat Log
                </h3>
                
                {antiCheatEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No suspicious activity</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {antiCheatEvents.map((event, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 rounded-lg border ${getSeverityColor(event.severity)}`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="text-xs font-medium">{event.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.timestamp.toLocaleTimeString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-[#27272a] space-y-2">
                <button className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Flag Session
                </button>
                <button className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <X className="w-4 h-4" />
                  Terminate Session
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { cn } from '@/lib/utils';

export default function Console() {
  const { consoleOutput, clearConsole } = useChallengeStore();
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[#0D1117] border border-gray-700 rounded-xl overflow-hidden h-full flex flex-col"
    >
      <div className="bg-[#161B22] px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Console</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
            {consoleOutput.length} messages
          </span>
        </div>
        <button
          onClick={clearConsole}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 hover:bg-gray-800 rounded"
          title="Clear console"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={consoleRef}
        className="flex-1 overflow-auto p-3 font-mono text-xs space-y-1"
      >
        <AnimatePresence>
          {consoleOutput.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 text-center py-8"
            >
              <TerminalIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Console output will appear here</p>
              <p className="text-xs mt-1">Run your code to see results</p>
            </motion.div>
          ) : (
            consoleOutput.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-start gap-2 py-1 px-2 rounded",
                  log.type === 'error' && 'bg-red-900/20',
                  log.type === 'warning' && 'bg-yellow-900/20',
                  log.type === 'success' && 'bg-green-900/20'
                )}
              >
                {getIcon(log.type)}
                <span className={cn("flex-1 break-all", getTextColor(log.type))}>
                  {log.text}
                </span>
                <span className="text-gray-600 text-[10px] shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-gray-700 px-3 py-2 bg-[#161B22]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Ready</span>
        </div>
      </div>
    </motion.div>
  );
}

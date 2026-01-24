'use client';

import { motion } from 'framer-motion';
import { XCircle, AlertTriangle, Shield, Cpu, Zap, Award } from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { cn } from '@/lib/utils';

export default function ScorePanel() {
  const { 
    securityScore, 
    architectureScore, 
    performanceScore, 
    totalScore,
    testsPassed,
    totalTests,
    trapDetected,
    vulnerabilitiesFound
  } = useChallengeStore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const scores = [
    { name: 'Security', score: securityScore, icon: Shield, max: 100, weight: '30%' },
    { name: 'Architecture', score: architectureScore, icon: Cpu, max: 100, weight: '25%' },
    { name: 'Performance', score: performanceScore, icon: Zap, max: 100, weight: '25%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#0D1117] border border-gray-700 rounded-xl overflow-hidden"
    >
      <div className="bg-[#161B22] px-4 py-3 border-b border-gray-700 flex items-center gap-2">
        <Award className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-gray-300">Score Panel</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Score */}
        <div className="bg-linear-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Score</span>
            <span className={cn("text-2xl font-bold", getScoreColor(totalScore))}>
              {totalScore}/100
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full", getProgressColor(totalScore))}
              initial={{ width: 0 }}
              animate={{ width: `${totalScore}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Passing score: 85/100
          </p>
        </div>

        {/* Individual Scores */}
        <div className="space-y-3">
          {scores.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{item.name}</span>
                  <span className="text-xs text-gray-600">({item.weight})</span>
                </div>
                <span className={cn("font-mono font-bold", getScoreColor(item.score))}>
                  {item.score}
                </span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full", getProgressColor(item.score))}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Results */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Tests Passed</span>
            <span className={cn(
              "font-mono font-bold",
              testsPassed === totalTests ? 'text-green-400' : 
              testsPassed >= totalTests / 2 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {testsPassed}/{totalTests}
            </span>
          </div>
        </div>

        {/* Trap Detection */}
        {trapDetected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/30 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-bold">TRAP DETECTED!</span>
            </div>
            <p className="text-xs text-red-300 mt-1">
              Hardcoded API key found in code. This is a critical security failure.
            </p>
          </motion.div>
        )}

        {/* Vulnerabilities */}
        {vulnerabilitiesFound.length > 0 && (
          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Vulnerabilities ({vulnerabilitiesFound.length})</span>
            </div>
            <ul className="space-y-1">
              {vulnerabilitiesFound.slice(0, 5).map((vuln, idx) => (
                <li key={idx} className="text-xs text-orange-300 flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  {vuln}
                </li>
              ))}
              {vulnerabilitiesFound.length > 5 && (
                <li className="text-xs text-orange-400">
                  +{vulnerabilitiesFound.length - 5} more...
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Shield, 
  Skull,
  Brain,
  Target,
  Microscope,
  Theater,
  XCircle,
  CheckCircle,
  Sparkles,
  Rocket
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import Typewriter from 'typewriter-effect';

export default function ChallengeOverview() {
  const { startChallenge, challengeStarted } = useChallengeStore();
  const [isHovered, setIsHovered] = useState(false);

  const extremeFeatures = [
    { icon: Brain, title: 'Multi-Dimensional Problem Space', desc: 'Optimize for: latency, cost, security, compliance, scalability - simultaneously' },
    { icon: Target, title: 'Real Production Constraints', desc: '$500/month budget for 1M requests across 3 regions - impossible without creative solutions' },
    { icon: Microscope, title: 'Research-Level Challenges', desc: 'Adversarial ML detection, semantic vector deduplication, Byzantine fault tolerance' },
    { icon: Theater, title: 'Hidden Complexity', desc: 'Requirements contain contradictions you must identify and negotiate' },
  ];

  const failureReasons = [
    { icon: XCircle, title: 'Over-engineering', desc: 'Building Kubernetes clusters when serverless would work better', type: 'fail' },
    { icon: XCircle, title: 'Blindly trusting AI output', desc: 'GPT-4 will suggest solutions that violate CAP theorem', type: 'fail' },
    { icon: XCircle, title: 'Ignoring economics', desc: 'Technically perfect solution that costs $10k/month', type: 'fail' },
    { icon: XCircle, title: 'Missing security mindset', desc: 'Focusing on performance while leaving admin panels exposed', type: 'fail' },
    { icon: CheckCircle, title: 'Top 1% approach', desc: 'Question requirements, propose alternatives, show tradeoffs with data', type: 'success' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-linear-to-r from-red-600 via-purple-600 to-blue-600 text-white p-8 rounded-2xl overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-orange-400 animate-pulse" />
            <h1 className="text-4xl font-bold">
              Elite AI-Architect Challenge
            </h1>
            <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
              EXTREME MODE
            </span>
          </div>

          <div className="text-xl mb-6 h-8">
            <Typewriter
              options={{
                strings: [
                  'This challenge has a 5% pass rate among IIT graduates.',
                  'Are you in the top 1%?',
                  'Most candidates score 30-40 out of 100.',
                  'Can you reach the 85 passing threshold?'
                ],
                autoStart: true,
                loop: true,
                deleteSpeed: 30,
              }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Clock, text: '120 Minutes' },
              { icon: Globe, text: 'Multi-Region' },
              { icon: Shield, text: 'Production-Grade' },
              { icon: Skull, text: '5% Pass Rate' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center gap-2"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-red-950/50 border-l-4 border-red-500 p-6 rounded-r-xl"
      >
        <h3 className="font-bold text-red-400 text-xl mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          WARNING: This is NOT a typical coding challenge
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Solving the algorithm is 10% of the problem',
            'You will face distributed systems paradoxes (CAP theorem)',
            'Security vulnerabilities are intentionally hidden in 7 layers',
            'The "correct" solution requires questioning the requirements',
            'AI will confidently give you wrong answers - verify everything',
          ].map((warning, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
              className="flex items-start gap-2 text-red-300"
            >
              <XCircle className="w-4 h-4 mt-1 shrink-0" />
              <span className="text-sm">{warning}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* What Makes This EXTREME */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-linear-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 p-6 rounded-xl"
        >
          <h3 className="font-bold text-lg mb-4 text-purple-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What Makes This EXTREME
          </h3>
          <div className="space-y-4">
            {extremeFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                className="flex gap-3"
              >
                <feature.icon className="w-8 h-8 text-purple-400 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-200">{feature.title}</p>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why IIT Students Fail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-linear-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 p-6 rounded-xl"
        >
          <h3 className="font-bold text-lg mb-4 text-blue-300 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Why IIT Students Fail
          </h3>
          <div className="space-y-3">
            {failureReasons.map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
                className={`p-3 rounded-lg border-l-4 ${
                  reason.type === 'success' 
                    ? 'bg-green-900/30 border-green-500' 
                    : 'bg-red-900/20 border-red-500/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <reason.icon className={`w-4 h-4 ${
                    reason.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`} />
                  <span className={`font-semibold text-sm ${
                    reason.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {reason.title}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-6">{reason.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Start Button */}
      <AnimatePresence>
        {!challengeStarted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={startChallenge}
            className="relative w-full bg-linear-to-r from-red-600 via-purple-600 to-blue-600 text-white py-5 rounded-xl font-bold text-xl overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: isHovered ? ['0%', '200%'] : '0%' }}
              transition={{ duration: 0.8 }}
            />
            <span className="relative z-10 flex items-center justify-center gap-3">
              <Rocket className="w-6 h-6" />
              I Accept the Challenge
              <Flame className="w-6 h-6" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

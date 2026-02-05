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
  User,
  Mail,
  Loader2
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { registerCandidate } from '@/lib/database/service';
import FireTransition from './FireTransition';

export default function ChallengeOverview() {
  const { startChallenge, challengeStarted, setSession, candidateEmail } = useChallengeStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showFireTransition, setShowFireTransition] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleStartClick = () => {
    if (candidateEmail) {
      // Already registered - trigger fire transition then start
      setShowFireTransition(true);
    } else {
      setShowRegistration(true);
    }
  };

  const handleFireComplete = () => {
    setShowFireTransition(false);
    startChallenge();
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sessionData = await registerCandidate(email.trim(), name.trim());

      if (sessionData) {
        setSession(sessionData.sessionId, sessionData.name, sessionData.email);
        setShowRegistration(false);
        // Trigger fire transition
        setShowFireTransition(true);
      } else {
        setError('Failed to register. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Fire Transition Effect */}
      <FireTransition isActive={showFireTransition} onComplete={handleFireComplete} />

      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] text-white p-8 rounded-2xl overflow-hidden border border-orange-500/30"
        >
          {/* Animated fire background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-600/40 to-transparent" />
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 animate-pulse" />
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
                  Elite AI-Architect Challenge
                </h1>
              </div>
              <span className="bg-orange-600 px-3 py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse w-fit">
                EXTREME MODE
              </span>
            </div>

            <div className="text-base sm:text-xl mb-6 text-gray-300 font-normal">
              This challenge has a 5% pass rate among IIT graduates. Are you in the top 1%?
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Clock, text: '45 Minutes' },
                { icon: Globe, text: 'Multi-Region' },
                { icon: Shield, text: 'Production-Grade' },
                { icon: Skull, text: '5% Pass Rate' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-black/40 backdrop-blur-sm px-4 py-3 rounded-lg flex items-center gap-2 border border-orange-500/20"
                >
                  <item.icon className="w-5 h-5 text-orange-400" />
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
          className="bg-[#12121a] border-l-4 border-l-orange-500 p-6 rounded-r-xl border border-[#27272a]"
        >
          <h3 className="font-bold text-orange-400 text-xl mb-4 flex items-center gap-2">
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
                className="flex items-start gap-2 text-orange-300"
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
            className="bg-[#12121a] border border-[#27272a] p-6 rounded-xl"
          >
            <h3 className="font-bold text-lg mb-4 text-orange-400 flex items-center gap-2">
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
                  <feature.icon className="w-8 h-8 text-orange-400 shrink-0" />
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
            className="bg-[#12121a] border border-[#27272a] p-6 rounded-xl"
          >
            <h3 className="font-bold text-lg mb-4 text-orange-400 flex items-center gap-2">
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
                  className={`p-3 rounded-lg border-l-4 ${reason.type === 'success'
                    ? 'bg-green-900/30 border-green-500'
                    : 'bg-red-900/20 border-red-500/50'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <reason.icon className={`w-4 h-4 ${reason.type === 'success' ? 'text-green-400' : 'text-red-400'
                      }`} />
                    <span className={`font-semibold text-sm ${reason.type === 'success' ? 'text-green-400' : 'text-red-400'
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

        {/* BE BRAVE TAKE THE CHALLENGE Button */}
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
              onClick={handleStartClick}
              className="relative w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white py-4 sm:py-6 rounded-xl font-bold text-lg sm:text-2xl overflow-hidden group border-2 border-orange-500/50 shadow-lg shadow-orange-500/30"
            >
              {/* Animated fire glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-orange-500/20 to-transparent"
                animate={{
                  opacity: isHovered ? [0.5, 1, 0.5] : 0.3,
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: isHovered ? ['0%', '200%'] : '0%' }}
                transition={{ duration: 0.8 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 tracking-wide px-2">
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse shrink-0" />
                <span className="text-center">BE BRAVE TAKE THE CHALLENGE</span>
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse shrink-0" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Registration Modal */}
        <AnimatePresence>
          {showRegistration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#12121a] border border-orange-500/30 rounded-2xl p-8 max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Register to Begin</h2>
                  <p className="text-gray-400 mt-2">Enter your details to start the challenge</p>
                </div>

                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-[#0a0a0f] border border-[#27272a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#0a0a0f] border border-[#27272a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRegistration(false)}
                      className="flex-1 py-3 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Flame className="w-5 h-5" />
                          START
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Your session will be monitored for security purposes
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

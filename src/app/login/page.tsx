'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Loader2, 
  Rocket, 
  Shield, 
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogIn
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { useRouter } from 'next/navigation';

export default function CandidateLoginPage() {
  const router = useRouter();
  const { setSession, candidateEmail } = useChallengeStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingCandidate, setExistingCandidate] = useState<{
    name: string;
    hasActiveSession: boolean;
    timeRemaining: number;
  } | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (candidateEmail) {
      router.push('/');
    }
  }, [candidateEmail, router]);

  // Check if email exists when typing
  useEffect(() => {
    const checkEmail = async () => {
      if (email && email.includes('@') && email.includes('.')) {
        setIsCheckingEmail(true);
        try {
          const response = await fetch(`/api/candidates/auth?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          
          if (data.exists) {
            setExistingCandidate({
              name: data.candidate.name,
              hasActiveSession: data.candidate.hasActiveSession,
              timeRemaining: data.candidate.timeRemaining || 0
            });
          } else {
            setExistingCandidate(null);
          }
        } catch {
          setExistingCandidate(null);
        } finally {
          setIsCheckingEmail(false);
        }
      } else {
        setExistingCandidate(null);
      }
    };

    const debounce = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounce);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!existingCandidate && !name.trim()) {
      setError('Name is required for new candidates');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/candidates/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: existingCandidate ? existingCandidate.name : name.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        if (!data.canContinue) {
          setError(data.message || 'You have already completed the challenge');
          return;
        }

        // Set session in store
        setSession(
          data.session.id, 
          data.candidate.name, 
          data.candidate.email
        );

        // Redirect to challenge
        router.push('/');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Elite Challenge
          </h1>
          <p className="text-gray-400">
            Authenticate to begin your challenge
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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
                  className="w-full bg-[#0a0a0f] border border-[#27272a] rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                />
                {isCheckingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
                )}
                {!isCheckingEmail && existingCandidate && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Existing Candidate Info */}
            <AnimatePresence>
              {existingCandidate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400 font-medium text-sm mb-1">
                      <LogIn className="w-4 h-4" />
                      Welcome back, {existingCandidate.name}!
                    </div>
                    {existingCandidate.hasActiveSession ? (
                      <div className="flex items-center gap-2 text-green-300/70 text-xs">
                        <Clock className="w-3 h-3" />
                        Active session - {formatTime(existingCandidate.timeRemaining)} remaining
                      </div>
                    ) : (
                      <p className="text-green-300/70 text-xs">
                        Click continue to resume or start a new session
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name Field - Only for new candidates */}
            <AnimatePresence>
              {!existingCandidate && email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
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
                      className="w-full bg-[#0a0a0f] border border-[#27272a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !email}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)' }}
              className="w-full py-3 hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {existingCandidate ? 'Resuming...' : 'Creating Session...'}
                </>
              ) : (
                <>
                  {existingCandidate ? (
                    <>
                      Continue Challenge
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Start Challenge
                    </>
                  )}
                </>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-5 border-t border-[#27272a]">
            <div className="text-center text-xs text-gray-500 space-y-2">
              <p>🔒 Your session will be monitored for security</p>
              <p>⏱️ Challenge duration: 45 minutes</p>
            </div>
          </div>
        </motion.div>

        {/* Admin Link */}
        <div className="text-center mt-6">
          <a 
            href="/admin" 
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            Admin Access →
          </a>
        </div>
      </motion.div>
    </div>
  );
}

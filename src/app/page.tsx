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
  LogIn,
  Lock,
  UserCog,
  Users
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic import for MainLayout (challenge platform)
const MainLayout = dynamic(() => import('@/components/MainLayout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-lg">Loading Elite Challenge Platform...</p>
      </div>
    </div>
  ),
});

// Neon Auth URL
const NEON_AUTH_URL = 'https://ep-sweet-unit-ahwph4ah.neonauth.c-3.us-east-1.aws.neon.tech/neondb/auth';

export default function Home() {
  const router = useRouter();
  const { setSession, candidateEmail, candidateName } = useChallengeStore();
  const { isAuthenticated: isAdminAuth, login: adminLogin } = useAdminStore();
  
  const [loginType, setLoginType] = useState<'candidate' | 'admin'>('candidate');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [existingCandidate, setExistingCandidate] = useState<{
    name: string;
    hasActiveSession: boolean;
    timeRemaining: number;
  } | null>(null);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check if email exists when typing (for candidates)
  useEffect(() => {
    if (loginType !== 'candidate') return;
    
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
  }, [email, loginType]);

  // If candidate is logged in, show the challenge platform
  if (isHydrated && candidateEmail) {
    return <MainLayout />;
  }

  // If admin is logged in, redirect to admin dashboard
  if (isHydrated && isAdminAuth) {
    router.push('/admin/dashboard');
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-400 text-lg">Redirecting to Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCandidateLogin = async (e: React.FormEvent) => {
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
        
        // Page will re-render and show MainLayout
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const success = await adminLogin(email.trim(), password);
      
      if (success) {
        router.push('/admin/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Admin login error:', err);
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

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
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
            className="w-24 h-24 bg-linear-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30"
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Elite AI-Architect
          </h1>
          <p className="text-gray-400 text-lg">
            Challenge Platform
          </p>
        </div>

        {/* Login Type Tabs */}
        <div className="flex gap-2 mb-6 bg-[#12121a] p-1.5 rounded-xl border border-[#27272a]">
          <button
            onClick={() => { setLoginType('candidate'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
              loginType === 'candidate'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
            }`}
          >
            <Users className="w-4 h-4" />
            Candidate
          </button>
          <button
            onClick={() => { setLoginType('admin'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
              loginType === 'admin'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
            }`}
          >
            <UserCog className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Login Form */}
        <motion.div
          key={loginType}
          initial={{ opacity: 0, x: loginType === 'candidate' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6"
        >
          <form onSubmit={loginType === 'candidate' ? handleCandidateLogin : handleAdminLogin} className="space-y-5">
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
                  placeholder={loginType === 'admin' ? 'admin@example.com' : 'you@example.com'}
                  className="w-full bg-[#0a0a0f] border border-[#27272a] rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  disabled={isLoading}
                />
                {loginType === 'candidate' && isCheckingEmail && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 animate-spin" />
                )}
                {loginType === 'candidate' && !isCheckingEmail && existingCandidate && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Candidate: Existing User Info */}
            {loginType === 'candidate' && (
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
            )}

            {/* Candidate: Name Field (new users only) */}
            {loginType === 'candidate' && (
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
            )}

            {/* Admin: Password Field */}
            {loginType === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#0a0a0f] border border-[#27272a] rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

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
              disabled={isLoading || !email || (loginType === 'admin' && !password)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                background: loginType === 'candidate' 
                  ? 'linear-gradient(to right, #2563eb, #7c3aed)' 
                  : 'linear-gradient(to right, #7c3aed, #9333ea)' 
              }}
              className="w-full py-3.5 hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loginType === 'candidate' 
                    ? (existingCandidate ? 'Resuming...' : 'Creating Session...') 
                    : 'Signing in...'}
                </>
              ) : (
                <>
                  {loginType === 'candidate' ? (
                    existingCandidate ? (
                      <>
                        Continue Challenge
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Start Challenge
                      </>
                    )
                  ) : (
                    <>
                      <UserCog className="w-5 h-5" />
                      Sign in as Admin
                    </>
                  )}
                </>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-5 border-t border-[#27272a]">
            <div className="text-center text-xs text-gray-500 space-y-2">
              {loginType === 'candidate' ? (
                <>
                  <p>🔒 Your session will be monitored for security</p>
                  <p>⏱️ Challenge duration: 45 minutes</p>
                </>
              ) : (
                <>
                  <p>🛡️ Admin access is restricted</p>
                  <p>📊 Monitor candidates in real-time</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-xs">
            © 2026 Elite AI-Architect Challenge Platform
          </p>
        </div>
      </motion.div>
    </div>
  );
}

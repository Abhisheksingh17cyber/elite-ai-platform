'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogIn,
  Lock,
  UserCog,
  Users,
  Flame,
  Code
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { useAdminStore } from '@/store/adminStore';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamic imports
const MainLayout = dynamic(() => import('@/components/MainLayout'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-lg">Loading Elite Challenge Platform...</p>
      </div>
    </div>
  ),
});

const CodeBackground = dynamic(() => import('@/components/CodeBackground'), {
  ssr: false,
});

export default function Home() {
  const router = useRouter();
  const { setSession, candidateEmail, candidateName } = useChallengeStore();
  const { isAuthenticated: isAdminAuth, login: adminLogin } = useAdminStore();
  const { data: session, status } = useSession();

  const [loginType, setLoginType] = useState<'candidate' | 'admin'>('candidate');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [googleSessionHandled, setGoogleSessionHandled] = useState(false);
  const [existingCandidate, setExistingCandidate] = useState<{
    name: string;
    hasActiveSession: boolean;
    timeRemaining: number;
  } | null>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle Google OAuth session
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email && !candidateEmail && !googleSessionHandled) {
      setGoogleSessionHandled(true);

      const createSessionFromGoogle = async () => {
        try {
          const response = await fetch('/api/candidates/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user?.email,
              name: session.user?.name || 'Google User'
            })
          });

          const data = await response.json();

          if (data.success && data.canContinue) {
            setSession(
              data.session.id,
              data.candidate.name,
              data.candidate.email
            );
          }
        } catch (err) {
          console.error('Failed to create session from Google auth:', err);
        }
      };

      createSessionFromGoogle();
    }
  }, [status, session, candidateEmail, googleSessionHandled, setSession]);

  // Check if email exists
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

  // Show challenge platform if logged in
  if (candidateEmail) {
    return <MainLayout />;
  }

  // Redirect admin
  if (isAdminAuth) {
    router.push('/admin/dashboard');
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error('Google login error:', err);
      setError('Failed to connect. Please try again.');
      setIsGoogleLoading(false);
    }
  };

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

        setSession(
          data.session.id,
          data.candidate.name,
          data.candidate.email
        );
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Interactive Code Background */}
      <CodeBackground />

      {/* Light overlay for readability - reduced opacity to show code */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/40 to-[#0a0a0f]/60 pointer-events-none z-[1]" />

      {/* Glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[2]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-red-600/10 rounded-full blur-[100px]" />
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
            className="w-24 h-24 bg-gradient-to-br from-orange-500 via-red-600 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Flame className="w-12 h-12 text-white relative z-10" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Elite AI-Architect
          </h1>
          <p className="text-gray-400 text-lg">
            Challenge Platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-orange-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>5% Pass Rate • Top 1% Developers</span>
          </div>
        </div>

        {/* Login Type Tabs */}
        <div className="flex gap-2 mb-6 bg-[#111118] p-1.5 rounded-xl border border-orange-500/20">
          <button
            onClick={() => { setLoginType('candidate'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${loginType === 'candidate'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30'
              : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
              }`}
          >
            <Users className="w-4 h-4" />
            Candidate
          </button>
          <button
            onClick={() => { setLoginType('admin'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${loginType === 'admin'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30'
              : 'text-gray-400 hover:text-white hover:bg-[#1a1a24]'
              }`}
          >
            <UserCog className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-b from-[#111118] to-[#0d0d14] border border-orange-500/20 rounded-2xl p-6 shadow-2xl shadow-black/50 backdrop-blur-sm">
          {loginType === 'candidate' ? (
            <form onSubmit={handleCandidateLogin} className="space-y-5">
              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-gray-100 disabled:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all shadow-lg"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0d0d14] text-gray-500">or continue with email</span>
                </div>
              </div>

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
                    className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
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
                        className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
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
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {existingCandidate ? 'Resuming...' : 'Creating Session...'}
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5" />
                    {existingCandidate ? 'Continue Challenge' : 'Start Challenge'}
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UserCog className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-gray-400 text-sm">Admin access only</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0f] border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>

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

              <motion.button
                type="submit"
                disabled={isLoading || !email || !password}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Access Dashboard
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Info */}
          <div className="mt-6 pt-5 border-t border-gray-800">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Your session will be monitored for security
              </p>
              <p className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Challenge duration: 45 minutes
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-xs">
          © 2026 Elite AI-Architect Challenge. Built for the top 1%.
        </div>
      </motion.div>
    </div>
  );
}

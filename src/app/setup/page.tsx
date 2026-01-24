'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'initializing' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Checking database connection...');
  const [details, setDetails] = useState<string[]>([]);

  const checkAndInitialize = useCallback(async () => {
    try {
      setStatus('initializing');
      setMessage('Initializing database tables...');
      
      const response = await fetch('/api/db/init', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Database initialized successfully!');
        setDetails([
          '✓ Candidates table ready',
          '✓ Test sessions table ready',
          '✓ Code snapshots table ready',
          '✓ Anti-cheat events table ready',
          '✓ Admin users table ready',
          '✓ Default admin account created'
        ]);
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage('Database initialization failed');
        setDetails([data.error || 'Unknown error']);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to connect to database');
      setDetails([String(error)]);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndInitialize();
    }, 0);
    return () => clearTimeout(timer);
  }, [checkAndInitialize]);

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
      case 'initializing':
        return (
          <svg className="animate-spin h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Database Setup
          </h1>
          <p className="text-slate-400 text-center mb-8">
            Elite AI-Architect Challenge Platform
          </p>

          {/* Status */}
          <div className="flex flex-col items-center gap-4 mb-6">
            {getStatusIcon()}
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {message}
            </p>
          </div>

          {/* Details */}
          {details.length > 0 && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <ul className="space-y-2">
                {details.map((detail, index) => (
                  <li 
                    key={index} 
                    className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-slate-300'}`}
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {status === 'error' && (
            <button
              onClick={checkAndInitialize}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              Retry Setup
            </button>
          )}

          {status === 'success' && (
            <p className="mt-6 text-sm text-slate-400 text-center">
              Redirecting to home page...
            </p>
          )}

          {/* Admin Info */}
          {status === 'success' && (
            <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <h3 className="text-blue-400 font-medium mb-2">Admin Access</h3>
              <p className="text-sm text-slate-400">
                Email: <code className="text-blue-300">admin@elitechallenge.com</code>
              </p>
              <p className="text-sm text-slate-400">
                Password: <code className="text-blue-300">admin123</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

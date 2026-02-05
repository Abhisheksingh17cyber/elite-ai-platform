'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  TestTube,
  Shield,
  Upload,
  Loader2,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { detectApiKeyTrap, detectSqlInjection, checkArchitecture } from '@/lib/utils';

export default function ActionButtons() {
  const router = useRouter();
  const {
    files,
    sessionId,
    challengeStarted,
    addConsoleOutput,
    updateScores,
    setTestResults,
    setTrapDetected,
    addVulnerability,
    endChallenge,
    clearSession,
    securityScore,
    architectureScore,
    performanceScore
  } = useChallengeStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    addConsoleOutput('info', '▶ Running code...');

    setTimeout(() => {
      addConsoleOutput('info', '📦 Building project...');
    }, 500);

    setTimeout(() => {
      addConsoleOutput('success', '✓ Build successful');
      addConsoleOutput('info', '🔍 Starting security scan...');
    }, 1500);

    setTimeout(() => {
      // Check all files for vulnerabilities
      const allCode = Object.values(files).join('\n');

      const trapResult = detectApiKeyTrap(allCode);
      if (!trapResult.passed) {
        addConsoleOutput('error', trapResult.message);
        setTrapDetected(true);
        addVulnerability('Hardcoded API Key');
      }

      const sqlResult = detectSqlInjection(allCode);
      if (!sqlResult.passed) {
        sqlResult.issues.forEach(issue => {
          addConsoleOutput('warning', `⚠️ ${issue}`);
          addVulnerability(issue);
        });
      }

      const archResult = checkArchitecture(allCode);
      updateScores(Math.min(securityScore, 100), 0, 0);
      setIsRunning(false);
    }, 2500);
  };

  const stopCode = () => {
    if (!isRunning) return;
    setIsRunning(false);
    addConsoleOutput('warning', '⏹ Execution stopped by user');
  };

  const runTests = () => {
    addConsoleOutput('info', '🧪 Running test suite (24 tests)...');

    const allCode = Object.values(files).join('\n');
    let passed = 0;
    const total = 24;

    setTimeout(() => {
      // Simulate test results based on code quality
      const trapResult = detectApiKeyTrap(allCode);
      const sqlResult = detectSqlInjection(allCode);
      const archResult = checkArchitecture(allCode);

      if (trapResult.passed) passed += 6;
      if (sqlResult.passed) passed += 6;
      passed += Math.floor(archResult.score / 10);

      setTestResults(passed, total);

      if (passed < 12) {
        addConsoleOutput('error', `❌ Tests failed: ${passed}/${total} passed`);
        addConsoleOutput('error', 'Critical security issues must be fixed first');
      } else if (passed < 18) {
        addConsoleOutput('warning', `⚠️ Partial success: ${passed}/${total} passed`);
        addConsoleOutput('info', 'Good progress! Keep improving security and architecture');
      } else {
        addConsoleOutput('success', `✅ Excellent! ${passed}/${total} tests passed`);
      }
    }, 2000);
  };

  const runSecurityScan = () => {
    addConsoleOutput('info', '🔐 Running deep security scan...');

    const allCode = Object.values(files).join('\n');

    setTimeout(() => {
      const trapResult = detectApiKeyTrap(allCode);
      const sqlResult = detectSqlInjection(allCode);

      let securityScore = 50;

      if (trapResult.passed) {
        securityScore += 25;
        addConsoleOutput('success', '✅ No hardcoded secrets detected');
      } else {
        addConsoleOutput('error', '❌ CRITICAL: Hardcoded secrets found!');
        addConsoleOutput('error', 'This is an automatic failure in real security audits');
      }

      if (sqlResult.passed) {
        securityScore += 25;
        addConsoleOutput('success', '✅ SQL injection checks passed');
      } else {
        addConsoleOutput('error', '❌ SQL injection vulnerabilities detected');
        sqlResult.issues.forEach(issue => {
          addConsoleOutput('warning', `   → ${issue}`);
        });
      }

      // Check for other security patterns
      if (allCode.includes('rate_limit') || allCode.includes('RateLimiter')) {
        securityScore += 10;
        addConsoleOutput('success', '✅ Rate limiting implemented');
      } else {
        addConsoleOutput('warning', '⚠️ No rate limiting detected');
      }

      if (allCode.includes('bcrypt') || allCode.includes('argon2') || allCode.includes('hashlib')) {
        securityScore += 10;
        addConsoleOutput('success', '✅ Password hashing implemented');
      }

      updateScores(Math.min(securityScore, 100), 0, 0);
      addConsoleOutput('info', `Security Score: ${Math.min(securityScore, 100)}/100`);
    }, 1500);
  };

  const submitCode = async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    addConsoleOutput('info', '📤 Preparing submission...');

    try {
      const allCode = Object.values(files).join('\n');
      const trapResult = detectApiKeyTrap(allCode);

      // Calculate final scores
      const sqlResult = detectSqlInjection(allCode);
      const archResult = checkArchitecture(allCode);

      let finalSecurityScore = securityScore;
      let finalArchScore = architectureScore;
      const finalPerfScore = performanceScore;

      // Update scores if not calculated yet
      if (finalSecurityScore === 0) {
        finalSecurityScore = trapResult.passed ? 50 : 0;
        finalSecurityScore += sqlResult.passed ? 30 : 0;
        finalSecurityScore = Math.min(finalSecurityScore, 100);
      }

      if (finalArchScore === 0) {
        finalArchScore = archResult.score;
      }

      const totalScore = (finalSecurityScore + finalArchScore + finalPerfScore) / 3;

      // Submit to database
      if (sessionId) {
        addConsoleOutput('info', '🚀 Submitting to server...');

        // Save final code snapshot
        await fetch(`/api/sessions/${sessionId}/code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: JSON.stringify(files),
            language: 'python'
          })
        });

        // Update session with final scores and completed status
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'completed',
            final_score: totalScore,
            security_score: finalSecurityScore,
            architecture_score: finalArchScore,
            performance_score: finalPerfScore,
            time_remaining: 0
          })
        });

        if (response.ok) {
          addConsoleOutput('success', '✅ Submission successful!');
          addConsoleOutput('info', `📊 Final Score: ${totalScore.toFixed(1)}/100`);
          addConsoleOutput('info', `   Security: ${finalSecurityScore}/100`);
          addConsoleOutput('info', `   Architecture: ${finalArchScore}/100`);
          addConsoleOutput('info', `   Performance: ${finalPerfScore}/100`);

          if (!trapResult.passed) {
            addConsoleOutput('warning', '⚠️ Hardcoded secrets detected - this affects your security score');
          }

          setIsSubmitted(true);
          endChallenge();

          // Auto-logout after 3 seconds
          addConsoleOutput('info', '🔄 Logging out in 3 seconds...');
          setTimeout(() => {
            clearSession();
            router.push('/');
          }, 3000);
        } else {
          addConsoleOutput('error', '❌ Submission failed. Please try again.');
        }
      } else {
        addConsoleOutput('error', '❌ No session found. Please refresh and try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      addConsoleOutput('error', '❌ Submission error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = "flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-3 sm:gap-4"
    >
      {/* Run/Stop Button */}
      {isRunning ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={stopCode}
          disabled={!challengeStarted}
          className={`${buttonClass} bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/30`}
        >
          <Square className="w-4 h-4" />
          Stop
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runCode}
          disabled={!challengeStarted}
          className={`${buttonClass} bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/30`}
        >
          <Play className="w-4 h-4" />
          Run Code
        </motion.button>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runTests}
        disabled={!challengeStarted || isRunning}
        className={`${buttonClass} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30`}
      >
        <TestTube className="w-4 h-4" />
        Run Tests
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runTests}
        disabled={!challengeStarted}
        className={`${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`}
      >
        <TestTube className="w-4 h-4" />
        Run Tests
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runSecurityScan}
        disabled={!challengeStarted || isRunning}
        className={`${buttonClass} bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-violet-500/30`}
      >
        <Shield className="w-4 h-4" />
        Security Scan
      </motion.button>

      <motion.button
        whileHover={{ scale: isSubmitted ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
        onClick={submitCode}
        disabled={!challengeStarted || isSubmitting || isSubmitted || isRunning}
        className={`${buttonClass} ${isSubmitted ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/30' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-orange-500/30'} text-white`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : isSubmitted ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Submitted
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Submit
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

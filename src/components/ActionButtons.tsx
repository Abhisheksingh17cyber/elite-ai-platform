'use client';

import { motion } from 'framer-motion';
import { 
  Play, 
  TestTube, 
  Shield, 
  Upload,
  Github
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { detectApiKeyTrap, detectSqlInjection, checkArchitecture } from '@/lib/utils';

export default function ActionButtons() {
  const { 
    files,
    challengeStarted,
    addConsoleOutput,
    updateScores,
    setTestResults,
    setTrapDetected,
    addVulnerability
  } = useChallengeStore();

  const runCode = () => {
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
      archResult.feedback.forEach(fb => {
        addConsoleOutput(fb.startsWith('✅') ? 'success' : 'warning', fb);
      });
    }, 2500);
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

  const submitCode = () => {
    addConsoleOutput('info', '📤 Preparing submission...');
    
    setTimeout(() => {
      const allCode = Object.values(files).join('\n');
      const trapResult = detectApiKeyTrap(allCode);
      
      if (!trapResult.passed) {
        addConsoleOutput('error', '🚫 SUBMISSION BLOCKED');
        addConsoleOutput('error', 'Cannot submit code with hardcoded credentials');
        addConsoleOutput('warning', 'Remove the API key "sk-prod-key-123" and use environment variables');
        return;
      }

      addConsoleOutput('success', '✅ Code validated for submission');
      addConsoleOutput('info', '🚀 Submitting to evaluation server...');
      
      setTimeout(() => {
        addConsoleOutput('success', '✅ Submission received!');
        addConsoleOutput('info', 'Your code is being evaluated. Results will be emailed within 24 hours.');
      }, 2000);
    }, 1000);
  };

  const buttonClass = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-3"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={runCode}
        disabled={!challengeStarted}
        className={`${buttonClass} bg-green-600 hover:bg-green-700 text-white`}
      >
        <Play className="w-4 h-4" />
        Run Code
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
        disabled={!challengeStarted}
        className={`${buttonClass} bg-purple-600 hover:bg-purple-700 text-white`}
      >
        <Shield className="w-4 h-4" />
        Security Scan
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={submitCode}
        disabled={!challengeStarted}
        className={`${buttonClass} bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white`}
      >
        <Upload className="w-4 h-4" />
        Submit
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.open('https://classroom.github.com', '_blank')}
        className={`${buttonClass} bg-gray-700 hover:bg-gray-600 text-white`}
      >
        <Github className="w-4 h-4" />
        GitHub Classroom
      </motion.button>
    </motion.div>
  );
}

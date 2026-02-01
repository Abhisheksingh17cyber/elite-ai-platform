import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChallengeState {
  // Session
  sessionId: string | null;
  candidateName: string;
  candidateEmail: string;

  // Challenge State
  challengeStarted: boolean;
  challengeCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  timeRemaining: number;

  // Code State
  code: string;
  activeFile: string;
  files: Record<string, string>;

  // Scores
  securityScore: number;
  architectureScore: number;
  performanceScore: number;
  totalScore: number;
  testsPassed: number;
  totalTests: number;

  // Console
  consoleOutput: Array<{ type: 'info' | 'warning' | 'error' | 'success'; text: string; timestamp: number }>;

  // Trap Detection
  trapDetected: boolean;
  vulnerabilitiesFound: string[];

  // Actions
  setSession: (sessionId: string, name: string, email: string) => void;
  startChallenge: () => void;
  endChallenge: () => void;
  updateCode: (code: string) => void;
  setActiveFile: (file: string) => void;
  updateFile: (filename: string, content: string) => void;
  decrementTime: () => void;
  addConsoleOutput: (type: 'info' | 'warning' | 'error' | 'success', text: string) => void;
  clearConsole: () => void;
  updateScores: (security: number, architecture: number, performance: number) => void;
  setTestResults: (passed: number, total: number) => void;
  setTrapDetected: (detected: boolean) => void;
  addVulnerability: (vulnerability: string) => void;
  resetChallenge: () => void;
  clearSession: () => void;
}

const CHALLENGE_DURATION = 45 * 60; // 45 minutes in seconds

const initialFiles: Record<string, string> = {
  'main.py': `# Elite Challenge - Distributed AI System with Multi-Region Failover
# Difficulty: Beyond IIT JEE Advanced

"""
SCENARIO:
You're building a production AI system that processes 1M+ requests/day
across 3 geographic regions with <50ms latency requirement.

The system must:
1. Handle cascading failures across regions
2. Implement vector-based semantic caching with consistency guarantees
3. Detect and prevent adversarial prompt injection attacks in real-time
4. Maintain ACID properties while using eventual consistency
5. Auto-scale based on predicted load (not reactive)

CONSTRAINTS:
- Budget: $500/month infrastructure
- 99.95% uptime SLA
- GDPR + HIPAA compliance
- Zero-downtime deployments

⚠️ IMPORTANT: The API key below is a TRAP. Real engineers NEVER commit secrets.
"""

import sqlite3
import requests

# BROKEN LEGACY CODE - FIX THIS NIGHTMARE

class AIRequestHandler:
    def __init__(self):
        self.db = sqlite3.connect('ai_cache.db')
        self.api_key = "sk-prod-key-123"  # TODO: This is fine, right? 🎣
        
    def process_request(self, user_input):
        # Step 1: Check cache (VULNERABLE TO SQL INJECTION!)
        query = f"SELECT response FROM cache WHERE input='{user_input}'"
        cached = self.db.execute(query).fetchone()
        
        if cached:
            return cached[0]
            
        # Step 2: Call AI (NO RETRY LOGIC, NO TIMEOUT!)
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={"model": "gpt-4", "messages": [{"role": "user", "content": user_input}]}
        ).json()
        
        # Step 3: Store in cache (VULNERABLE TO SQL INJECTION!)
        self.db.execute(f"INSERT INTO cache VALUES ('{user_input}', '{response}')")
        self.db.commit()
        
        return response

# YOUR TASK: Transform this into a production-grade distributed system
# Requirements:
# 1. Remove ALL security vulnerabilities
# 2. Implement proper secret management
# 3. Add connection pooling and retry logic
# 4. Implement circuit breaker pattern
# 5. Add proper logging and monitoring hooks
`,
  'auth_service.py': `# Authentication Service - Currently INSECURE
# TODO: Implement proper authentication

class AuthService:
    def __init__(self):
        self.users = {}
        self.admin_password = "admin123"  # SECURITY ISSUE!
        
    def authenticate(self, username, password):
        # WARNING: No rate limiting, no password hashing
        if username == "admin" and password == self.admin_password:
            return {"role": "admin", "token": "static-token-123"}
        return None
        
    def validate_token(self, token):
        # WARNING: Static token validation
        return token == "static-token-123"
`,
  'vector_cache.py': `# Vector Cache Service - Stub Implementation
# TODO: Implement semantic caching with Pinecone/Weaviate

class VectorCache:
    def __init__(self):
        self.cache = {}  # In-memory only - NOT DISTRIBUTED!
        
    def get_similar(self, query_embedding, threshold=0.95):
        # TODO: Implement actual vector similarity search
        return None
        
    def store(self, embedding, response):
        # TODO: Implement distributed storage
        self.cache[str(embedding)] = response
`,
  'load_balancer.py': `# Load Balancer - Single Region Only!
# TODO: Implement multi-region with failover

class LoadBalancer:
    def __init__(self):
        self.backends = ["http://localhost:8000"]  # Single backend!
        self.current = 0
        
    def get_backend(self):
        # Round-robin only - no health checks!
        backend = self.backends[self.current]
        self.current = (self.current + 1) % len(self.backends)
        return backend
`,
  'security_scan.py': `# Security Scanner - Run this to check your code
# This simulates production security scanning

def scan_for_vulnerabilities(code: str) -> dict:
    vulnerabilities = []
    
    # Check for hardcoded secrets
    if "sk-" in code or "api_key" in code.lower():
        if "environ" not in code and "getenv" not in code:
            vulnerabilities.append({
                "severity": "CRITICAL",
                "type": "Hardcoded Secret",
                "message": "API keys should be loaded from environment variables"
            })
    
    # Check for SQL injection
    if "f'" in code or 'f"' in code:
        if "SELECT" in code or "INSERT" in code:
            vulnerabilities.append({
                "severity": "CRITICAL", 
                "type": "SQL Injection",
                "message": "Use parameterized queries instead of string formatting"
            })
    
    # Check for missing error handling
    if "try:" not in code and "try {" not in code:
        vulnerabilities.append({
            "severity": "HIGH",
            "type": "Missing Error Handling",
            "message": "Add try-except blocks for external API calls"
        })
    
    return {
        "total": len(vulnerabilities),
        "vulnerabilities": vulnerabilities
    }
`,
  'tests.py': `# Test Suite - 24 Tests Total
# Your code must pass ALL tests to proceed

import unittest

class SecurityTests(unittest.TestCase):
    def test_no_hardcoded_api_keys(self):
        """API keys must come from environment variables"""
        pass
        
    def test_sql_injection_prevention(self):
        """All SQL queries must use parameterized statements"""
        pass
        
    def test_password_hashing(self):
        """Passwords must be hashed with bcrypt/argon2"""
        pass
        
    def test_rate_limiting(self):
        """API endpoints must have rate limiting"""
        pass
        
    def test_input_validation(self):
        """All user inputs must be validated"""
        pass
        
    def test_prompt_injection_detection(self):
        """System must detect and block prompt injections"""
        pass

class ArchitectureTests(unittest.TestCase):
    def test_service_isolation(self):
        """Services must be properly isolated"""
        pass
        
    def test_circuit_breaker(self):
        """Circuit breaker pattern must be implemented"""
        pass
        
    def test_retry_logic(self):
        """Retry logic with exponential backoff required"""
        pass
        
    def test_connection_pooling(self):
        """Database connections must be pooled"""
        pass
        
    def test_caching_strategy(self):
        """Proper caching strategy must be implemented"""
        pass
        
    def test_multi_region_support(self):
        """System must support multi-region deployment"""
        pass

class PerformanceTests(unittest.TestCase):
    def test_latency_under_50ms(self):
        """P99 latency must be under 50ms"""
        pass
        
    def test_throughput_1m_daily(self):
        """System must handle 1M requests/day"""
        pass
        
    def test_cost_under_500(self):
        """Infrastructure cost must be under $500/month"""
        pass
        
    def test_cache_hit_rate(self):
        """Cache hit rate must be above 95%"""
        pass

class ComplianceTests(unittest.TestCase):
    def test_gdpr_compliance(self):
        """System must be GDPR compliant"""
        pass
        
    def test_hipaa_compliance(self):
        """System must be HIPAA compliant"""
        pass
        
    def test_audit_logging(self):
        """All actions must be logged for audit"""
        pass
        
    def test_data_encryption(self):
        """Data must be encrypted at rest and in transit"""
        pass

class FailoverTests(unittest.TestCase):
    def test_region_failover(self):
        """System must failover between regions"""
        pass
        
    def test_graceful_degradation(self):
        """System must degrade gracefully under load"""
        pass
        
    def test_chaos_engineering(self):
        """System must survive chaos testing"""
        pass
        
    def test_zero_downtime_deploy(self):
        """Deployments must have zero downtime"""
        pass
`,
  'docker-compose.yml': `# Docker Compose - Production Configuration
# TODO: Configure for multi-region deployment

version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://localhost/ai_cache
      # TODO: Add proper secret management
    # TODO: Add health checks
    # TODO: Add resource limits
    # TODO: Add logging configuration

  # TODO: Add Redis for caching
  # TODO: Add PostgreSQL for persistence
  # TODO: Add Nginx for load balancing
  # TODO: Add Prometheus for monitoring
`,
  'terraform/main.tf': `# Terraform Configuration - Infrastructure as Code
# TODO: Implement multi-region deployment

provider "aws" {
  region = "us-east-1"  # TODO: Multi-region
}

# TODO: Implement the following:
# - Multi-region VPC setup
# - ECS/EKS cluster
# - RDS with read replicas
# - ElastiCache for Redis
# - CloudFront for edge caching
# - Route53 for DNS failover
# - CloudWatch for monitoring
# - WAF for security

# Current setup: NOTHING - You need to build this!

# Budget constraint: $500/month
# Hint: Consider serverless options (Lambda, Fargate Spot)
# Hint: Use reserved capacity for predictable workloads
# Hint: Implement auto-scaling based on predictions, not reactions
`
};

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      // Initial State
      sessionId: null,
      candidateName: '',
      candidateEmail: '',
      challengeStarted: false,
      challengeCompleted: false,
      startTime: null,
      endTime: null,
      timeRemaining: CHALLENGE_DURATION,
      code: initialFiles['main.py'],
      activeFile: 'main.py',
      files: initialFiles,
      securityScore: 0,
      architectureScore: 0,
      performanceScore: 0,
      totalScore: 0,
      testsPassed: 0,
      totalTests: 24,
      consoleOutput: [],
      trapDetected: false,
      vulnerabilitiesFound: [],

      // Actions
      setSession: (sessionId, name, email) => set({
        sessionId,
        candidateName: name,
        candidateEmail: email
      }),

      startChallenge: () => set({
        challengeStarted: true,
        startTime: Date.now(),
        timeRemaining: CHALLENGE_DURATION,
        consoleOutput: [{
          type: 'info',
          text: '🚀 Challenge started! You have 45 minutes. Good luck!',
          timestamp: Date.now()
        }]
      }),

      endChallenge: () => set({
        challengeCompleted: true,
        endTime: Date.now()
      }),

      updateCode: (code) => {
        const { activeFile, files } = get();
        set({
          code,
          files: { ...files, [activeFile]: code }
        });
      },

      setActiveFile: (file) => {
        const { files } = get();
        set({
          activeFile: file,
          code: files[file] || ''
        });
      },

      updateFile: (filename, content) => {
        const { files, activeFile } = get();
        const newFiles = { ...files, [filename]: content };
        set({
          files: newFiles,
          code: filename === activeFile ? content : get().code
        });
      },

      decrementTime: () => {
        const { timeRemaining, challengeStarted } = get();
        if (challengeStarted && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        } else if (timeRemaining === 0) {
          get().endChallenge();
        }
      },

      addConsoleOutput: (type, text) => set((state) => ({
        consoleOutput: [...state.consoleOutput, { type, text, timestamp: Date.now() }]
      })),

      clearConsole: () => set({ consoleOutput: [] }),

      updateScores: (security, architecture, performance) => set({
        securityScore: security,
        architectureScore: architecture,
        performanceScore: performance,
        totalScore: security + architecture + performance
      }),

      setTestResults: (passed, total) => set({
        testsPassed: passed,
        totalTests: total
      }),

      setTrapDetected: (detected) => set({ trapDetected: detected }),

      addVulnerability: (vulnerability) => set((state) => ({
        vulnerabilitiesFound: [...state.vulnerabilitiesFound, vulnerability]
      })),

      resetChallenge: () => set({
        challengeStarted: false,
        challengeCompleted: false,
        startTime: null,
        endTime: null,
        timeRemaining: CHALLENGE_DURATION,
        code: initialFiles['main.py'],
        activeFile: 'main.py',
        files: initialFiles,
        securityScore: 0,
        architectureScore: 0,
        performanceScore: 0,
        totalScore: 0,
        testsPassed: 0,
        consoleOutput: [],
        trapDetected: false,
        vulnerabilitiesFound: []
      }),

      clearSession: () => set({
        sessionId: null,
        candidateName: '',
        candidateEmail: '',
        challengeStarted: false,
        challengeCompleted: false,
        startTime: null,
        endTime: null,
        timeRemaining: CHALLENGE_DURATION,
        code: initialFiles['main.py'],
        activeFile: 'main.py',
        files: initialFiles,
        securityScore: 0,
        architectureScore: 0,
        performanceScore: 0,
        totalScore: 0,
        testsPassed: 0,
        consoleOutput: [],
        trapDetected: false,
        vulnerabilitiesFound: []
      })
    }),
    {
      name: 'elite-challenge-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        candidateName: state.candidateName,
        candidateEmail: state.candidateEmail,
        challengeStarted: state.challengeStarted,
        startTime: state.startTime,
        timeRemaining: state.timeRemaining,
        files: state.files,
        activeFile: state.activeFile
      })
    }
  )
);

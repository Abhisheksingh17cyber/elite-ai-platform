import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Trap Detection: Check if the original API key is still in the code
export function detectApiKeyTrap(code: string): { passed: boolean; message: string } {
  const trapKey = "sk-prod-key-123";
  const hardcodedPatterns = [
    /api_key\s*=\s*["'][^"']+["']/gi,
    /Bearer\s+sk-[a-zA-Z0-9]+/gi,
    /sk-[a-zA-Z0-9]{20,}/gi,
    /password\s*=\s*["'][^"']+["']/gi,
  ];

  if (code.includes(trapKey)) {
    return {
      passed: false,
      message: "❌ CRITICAL: Hardcoded API key detected! The original test key 'sk-prod-key-123' must be removed and replaced with environment variables."
    };
  }

  for (const pattern of hardcodedPatterns) {
    if (pattern.test(code)) {
      return {
        passed: false,
        message: "⚠️ WARNING: Potential hardcoded credentials detected. Use environment variables instead."
      };
    }
  }

  return {
    passed: true,
    message: "✅ No hardcoded credentials detected."
  };
}

// SQL Injection Detection
export function detectSqlInjection(code: string): { passed: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check for string concatenation in SQL queries
  const sqlConcatPattern = /f["']SELECT.*\{.*\}.*["']/gi;
  const sqlFormatPattern = /execute\s*\(\s*f?["'].*\+.*["']/gi;
  const rawQueryPattern = /\.execute\s*\(\s*f?["'].*WHERE.*=.*\{/gi;

  if (sqlConcatPattern.test(code)) {
    issues.push("SQL query uses string interpolation (f-strings) - vulnerable to SQL injection");
  }
  if (sqlFormatPattern.test(code)) {
    issues.push("SQL query uses string concatenation - vulnerable to SQL injection");
  }
  if (rawQueryPattern.test(code)) {
    issues.push("Raw SQL query with user input - use parameterized queries");
  }

  return {
    passed: issues.length === 0,
    issues
  };
}

// Architecture Check
export function checkArchitecture(code: string): { score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  // Check for class/module separation
  if ((code.match(/class\s+\w+/g) || []).length >= 3) {
    score += 15;
    feedback.push("✅ Good class separation detected");
  } else {
    feedback.push("❌ Consider breaking down into multiple classes/services");
  }

  // Check for environment variable usage
  if (code.includes("os.environ") || code.includes("process.env") || code.includes("getenv")) {
    score += 10;
    feedback.push("✅ Using environment variables for configuration");
  } else {
    feedback.push("❌ Use environment variables for sensitive configuration");
  }

  // Check for error handling
  if (code.includes("try:") || code.includes("try {") || code.includes("except") || code.includes("catch")) {
    score += 10;
    feedback.push("✅ Error handling implemented");
  } else {
    feedback.push("❌ Add proper error handling");
  }

  // Check for async patterns
  if (code.includes("async") || code.includes("await") || code.includes("Promise")) {
    score += 10;
    feedback.push("✅ Async patterns detected for better performance");
  }

  // Check for caching implementation
  if (code.includes("cache") || code.includes("redis") || code.includes("memcache")) {
    score += 10;
    feedback.push("✅ Caching mechanism implemented");
  }

  return { score, feedback };
}

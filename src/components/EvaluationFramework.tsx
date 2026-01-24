'use client';

import { motion } from 'framer-motion';
import { 
  XCircle, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Cpu,
  Zap,
  Brain,
  Rocket,
  Target
} from 'lucide-react';

export default function EvaluationFramework() {
  const criticalFailures = [
    {
      title: 'Security vulnerabilities in production',
      desc: 'SQL injection, exposed secrets, no rate limiting',
    },
    {
      title: 'Cannot explain CAP theorem tradeoffs',
      desc: 'Claiming strong consistency + high availability + partition tolerance',
    },
    {
      title: 'Cost exceeds budget by >50%',
      desc: '$750+/month solution (shows no business awareness)',
    },
    {
      title: 'Copy-pasted AI code without audit',
      desc: 'We detect this - you\'re out immediately',
    },
  ];

  const topPercentile = [
    {
      title: 'Challenge the requirements',
      desc: '"Why 3 regions? 2 with edge caching might be better"',
    },
    {
      title: 'Present alternatives with data',
      desc: 'Show 3 architectures with cost/latency/complexity matrix',
    },
    {
      title: 'Use AI strategically, not blindly',
      desc: 'Generate boilerplate, verify security, test edge cases manually',
    },
    {
      title: 'Think like a CTO',
      desc: 'Business impact, team velocity, operational burden',
    },
  ];

  const scoringRubric = [
    {
      category: 'System Architecture',
      points: 25,
      icon: Cpu,
      items: ['Service decomposition (10)', 'Data flow design (5)', 'Failure modes analysis (5)', 'Scalability proof (5)'],
    },
    {
      category: 'Security & Compliance',
      points: 20,
      icon: Shield,
      items: ['Vulnerability remediation (10)', 'Prompt injection defense (5)', 'Compliance framework (5)'],
    },
    {
      category: 'Performance & Cost',
      points: 20,
      icon: Zap,
      items: ['Latency optimization (10)', 'Cost calculation accuracy (5)', 'Resource efficiency (5)'],
    },
    {
      category: 'AI Integration',
      points: 15,
      icon: Brain,
      items: ['Vector cache implementation (8)', 'Semantic deduplication (4)', 'AI safety measures (3)'],
    },
    {
      category: 'Production Readiness',
      points: 20,
      icon: Rocket,
      items: ['Monitoring & alerting (5)', 'Deployment automation (5)', 'Chaos testing (5)', 'Documentation (5)'],
    },
  ];

  return (
    <div className="space-y-8">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white flex items-center gap-3"
      >
        <Target className="w-8 h-8 text-purple-400" />
        Extreme Evaluation Framework
      </motion.h2>

      {/* Passing Score Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-950/50 border-l-4 border-red-500 p-4 rounded-r-xl"
      >
        <p className="font-bold text-red-400 text-lg">
          Passing Score: 85/100 
          <span className="text-red-300 font-normal ml-2">
            (Most candidates score 30-40)
          </span>
        </p>
      </motion.div>

      {/* Critical Failures & Top 1% */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Critical Failures */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-5"
        >
          <h3 className="font-bold text-lg text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Critical Failures (Instant Elimination)
          </h3>
          <div className="space-y-3">
            {criticalFailures.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-red-900/30 p-3 rounded-lg flex gap-3"
              >
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top 1% */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-linear-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-5"
        >
          <h3 className="font-bold text-lg text-green-400 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            What Top 1% Do Differently
          </h3>
          <div className="space-y-3">
            {topPercentile.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-green-900/30 p-3 rounded-lg flex gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-300 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Scoring Rubric */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 border border-gray-700 rounded-xl p-6"
      >
        <h3 className="font-bold text-xl text-white mb-6">
          Detailed Scoring Rubric (100 points total)
        </h3>
        <div className="space-y-4">
          {scoringRubric.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="bg-gray-800/50 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <section.icon className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-gray-200">{section.category}</h4>
                </div>
                <span className="font-bold text-purple-400">{section.points} pts</span>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="text-sm text-gray-400 flex items-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-gray-600 rounded shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

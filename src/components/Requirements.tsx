'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';

interface Requirement {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'bonus';
  points?: number;
  completed: boolean;
}

const requirements: Requirement[] = [
  {
    id: '1',
    title: 'Multi-region deployment with automatic failover',
    description: 'Prove it works with chaos engineering tests',
    category: 'core',
    completed: false
  },
  {
    id: '2',
    title: 'Vector semantic caching with 95%+ hit rate',
    description: 'Deduplication must handle paraphrases',
    category: 'core',
    completed: false
  },
  {
    id: '3',
    title: 'Real-time prompt injection detection',
    description: 'Block: jailbreaks, PII extraction, system prompts',
    category: 'core',
    completed: false
  },
  {
    id: '4',
    title: 'Cost optimization: $500/month for 1M requests',
    description: 'Show calculations with pricing proof',
    category: 'core',
    completed: false
  },
  {
    id: '5',
    title: 'Remove ALL hardcoded credentials',
    description: 'Use environment variables and secret management',
    category: 'core',
    completed: false
  },
  {
    id: '6',
    title: 'Byzantine fault tolerance for cache',
    description: 'Implement distributed consensus',
    category: 'bonus',
    points: 15,
    completed: false
  },
  {
    id: '7',
    title: 'ML-based predictive auto-scaling',
    description: 'Not reactive - predict load patterns',
    category: 'bonus',
    points: 10,
    completed: false
  },
  {
    id: '8',
    title: 'Zero-downtime blue-green deployment',
    description: 'Automated rollback capability',
    category: 'bonus',
    points: 10,
    completed: false
  },
  {
    id: '9',
    title: 'Compliance framework (GDPR + HIPAA)',
    description: 'Full audit trail implementation',
    category: 'bonus',
    points: 5,
    completed: false
  }
];

export default function Requirements() {
  const coreReqs = requirements.filter(r => r.category === 'core');
  const bonusReqs = requirements.filter(r => r.category === 'bonus');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="grid md:grid-cols-2 gap-4"
    >
      {/* Core Requirements */}
      <div className="bg-linear-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-4">
        <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Core Requirements (Must Pass)
        </h3>
        <div className="space-y-3">
          {coreReqs.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-black/30 rounded-lg"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                req.completed 
                  ? 'border-green-500 bg-green-500/20' 
                  : 'border-gray-600'
              }`}>
                {req.completed && <CheckCircle className="w-3 h-3 text-green-400" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-200 text-sm">{req.title}</p>
                <p className="text-xs text-gray-500 mt-1">{req.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bonus Requirements */}
      <div className="bg-linear-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
        <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
          <ChevronRight className="w-5 h-5" />
          Advanced Challenges (Bonus)
        </h3>
        <div className="space-y-3">
          {bonusReqs.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-black/30 rounded-lg"
            >
              <span className="text-xs bg-purple-600/50 text-purple-200 px-2 py-1 rounded font-medium shrink-0">
                +{req.points}%
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-200 text-sm">{req.title}</p>
                <p className="text-xs text-gray-500 mt-1">{req.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

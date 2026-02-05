'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { useChallengeStore } from '@/store/challengeStore';

export default function Timer() {
  const { timeRemaining, challengeStarted, decrementTime } = useChallengeStore();
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!challengeStarted) return;

    const interval = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [challengeStarted, decrementTime]);

  useEffect(() => {
    setIsUrgent(timeRemaining <= 15 * 60); // 15 minutes
    setIsCritical(timeRemaining <= 5 * 60); // 5 minutes
  }, [timeRemaining]);

  const getTimerColor = () => {
    if (isCritical) return 'from-red-600 to-red-800';
    if (isUrgent) return 'from-orange-500 to-red-600';
    return 'from-purple-600 to-blue-600';
  };

  const getTextColor = () => {
    if (isCritical) return 'text-red-400';
    if (isUrgent) return 'text-orange-400';
    return 'text-white';
  };

  return (
    <motion.div
      className={`bg-linear-to-r ${getTimerColor()} rounded-xl p-4 shadow-2xl`}
      animate={{
        scale: isCritical ? [1, 1.02, 1] : 1,
        boxShadow: isCritical
          ? ['0 0 20px rgba(239, 68, 68, 0.5)', '0 0 40px rgba(239, 68, 68, 0.8)', '0 0 20px rgba(239, 68, 68, 0.5)']
          : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
      transition={{
        duration: 1,
        repeat: isCritical ? Infinity : 0,
        repeatType: 'reverse'
      }}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: challengeStarted ? 360 : 0 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            <Clock className={`w-6 h-6 sm:w-8 sm:h-8 ${getTextColor()}`} />
          </motion.div>
          {isCritical && (
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </motion.div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">Time Remaining</span>
          <motion.span
            className={`font-mono text-xl sm:text-3xl font-bold ${getTextColor()}`}
            key={timeRemaining}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatTime(timeRemaining)}
          </motion.span>
        </div>

        <AnimatePresence>
          {isUrgent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                {isCritical ? 'FINAL MINUTES!' : 'Hurry up!'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isCritical ? 'bg-red-400' : isUrgent ? 'bg-orange-400' : 'bg-white'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeRemaining / (45 * 60)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}

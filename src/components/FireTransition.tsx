'use client';

import { motion } from 'framer-motion';

interface FireTransitionProps {
    isActive: boolean;
    onComplete: () => void;
}

export default function FireTransition({ isActive, onComplete }: FireTransitionProps) {
    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
            onAnimationComplete={() => {
                setTimeout(onComplete, 1500);
            }}
        >
            {/* Fire particles rising from bottom */}
            {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        bottom: '-20px',
                        width: `${10 + Math.random() * 30}px`,
                        height: `${10 + Math.random() * 30}px`,
                        background: `radial-gradient(circle, ${['#ff4500', '#ff6b35', '#ff8c00', '#ffa500', '#ffcc00'][Math.floor(Math.random() * 5)]
                            } 0%, transparent 70%)`,
                        filter: 'blur(2px)',
                    }}
                    initial={{ y: 0, opacity: 0, scale: 0 }}
                    animate={{
                        y: [0, -window.innerHeight - 100],
                        opacity: [0, 1, 1, 0],
                        scale: [0.5, 1.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5 + Math.random() * 0.5,
                        delay: Math.random() * 0.3,
                        ease: 'easeOut',
                    }}
                />
            ))}

            {/* Large fire waves */}
            <motion.div
                className="absolute inset-x-0 bottom-0 h-screen"
                style={{
                    background: 'linear-gradient(to top, #ff4500 0%, #ff6b35 20%, #ff8c00 40%, transparent 100%)',
                }}
                initial={{ y: '100%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
            />

            {/* Secondary fire wave */}
            <motion.div
                className="absolute inset-x-0 bottom-0 h-screen"
                style={{
                    background: 'linear-gradient(to top, #ff6b35 0%, #ffa500 30%, transparent 100%)',
                }}
                initial={{ y: '100%' }}
                animate={{ y: '-100%' }}
                transition={{ duration: 1.4, delay: 0.1, ease: 'easeInOut' }}
            />

            {/* Final dark overlay */}
            <motion.div
                className="absolute inset-0 bg-[#080b12]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
            />
        </motion.div>
    );
}

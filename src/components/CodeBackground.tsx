'use client';

import { useEffect, useRef, useState } from 'react';

interface CodeParticle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    text: string;
    size: number;
    opacity: number;
    color: string;
}

const codeSnippets = [
    'const api = await fetch()',
    'function handleAuth() {}',
    'if (isSecure) return true',
    'class SystemArchitect',
    'async function deploy()',
    'try { await connect() }',
    'export default config',
    'import { Shield } from',
    'const token = jwt.sign()',
    'db.query(SELECT * FROM)',
    'return res.json(data)',
    'useEffect(() => {}, [])',
    'setState(prev => ...)',
    'router.push("/admin")',
    'process.env.SECRET',
    'middleware.verify()',
    'const hash = bcrypt()',
    'socket.emit("update")',
    'redis.set(key, val)',
    'kafka.produce(msg)',
    'docker run -d -p',
    'kubectl apply -f',
    'terraform init',
    'git push origin',
    'npm run build',
    'yarn deploy',
    'SELECT * FROM users',
    'INSERT INTO logs',
    'CREATE TABLE IF',
    'DROP INDEX idx',
];

const colors = [
    '#ff6b35', // orange
    '#f7931e', // amber
    '#ff4757', // red
    '#ffa502', // gold
    '#ff7f50', // coral
    '#e84118', // crimson
];

export default function CodeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<CodeParticle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number | undefined>(undefined);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (dimensions.width === 0) return;

        // Initialize particles
        const particles: CodeParticle[] = [];
        const particleCount = Math.floor((dimensions.width * dimensions.height) / 25000);

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                id: i,
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
                size: 10 + Math.random() * 4,
                opacity: 0.3 + Math.random() * 0.4,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }

        particlesRef.current = particles;
    }, [dimensions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            ctx.clearRect(0, 0, dimensions.width, dimensions.height);

            particlesRef.current.forEach((particle) => {
                // Calculate distance from mouse
                const dx = particle.x - mouseRef.current.x;
                const dy = particle.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const repelRadius = 150;

                // Repel from cursor
                if (distance < repelRadius && distance > 0) {
                    const force = (repelRadius - distance) / repelRadius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx += Math.cos(angle) * force * 2;
                    particle.vy += Math.sin(angle) * force * 2;
                }

                // Apply friction
                particle.vx *= 0.98;
                particle.vy *= 0.98;

                // Add slight random movement
                particle.vx += (Math.random() - 0.5) * 0.1;
                particle.vy += (Math.random() - 0.5) * 0.1;

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Wrap around screen
                if (particle.x < -200) particle.x = dimensions.width + 100;
                if (particle.x > dimensions.width + 200) particle.x = -100;
                if (particle.y < -50) particle.y = dimensions.height + 50;
                if (particle.y > dimensions.height + 50) particle.y = -50;

                // Draw particle
                ctx.font = `${particle.size}px 'JetBrains Mono', 'Fira Code', monospace`;
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.opacity;
                ctx.fillText(particle.text, particle.x, particle.y);
            });

            ctx.globalAlpha = 1;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [dimensions]);

    return (
        <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
}

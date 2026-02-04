'use client';

import { useEffect, useRef, useState } from 'react';

interface CodeLine {
    id: number;
    x: number;
    y: number;
    speed: number;
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
    'docker run -d -p 8080',
    'kubectl apply -f pod',
    'terraform init plan',
    'git push origin main',
    'npm run build --prod',
    'yarn deploy staging',
    'SELECT * FROM users',
    'INSERT INTO sessions',
    'CREATE TABLE IF NOT',
    'DROP INDEX idx_cache',
    'async validateToken()',
    'private readonly db',
    'public static main()',
    'interface IChallenge',
    'type UserSession = {}',
    'enum AuthStatus {}',
    'const [state, set] =',
    'useCallback(() => {})',
    'useMemo(() => data)',
    'React.createElement()',
];

const colors = [
    '#ff6b35', // bright orange
    '#ff8c42', // lighter orange
    '#ff5722', // deep orange
    '#ff7043', // coral orange
    '#ffa726', // amber
    '#ffb74d', // light amber
    '#f57c00', // dark orange
    '#ef6c00', // burnt orange
];

export default function CodeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const linesRef = useRef<CodeLine[]>([]);
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

        // Initialize code lines - vertical columns
        const lines: CodeLine[] = [];
        const columnCount = Math.floor(dimensions.width / 200); // One column every 200px

        for (let col = 0; col < columnCount; col++) {
            // Multiple lines per column at different starting positions
            const linesPerColumn = 8;
            for (let i = 0; i < linesPerColumn; i++) {
                lines.push({
                    id: col * linesPerColumn + i,
                    x: (col * (dimensions.width / columnCount)) + 20,
                    y: (i * (dimensions.height / linesPerColumn)) - Math.random() * 200,
                    speed: 1 + Math.random() * 2, // Varying speeds
                    text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
                    size: 12 + Math.random() * 4,
                    opacity: 0.6 + Math.random() * 0.4, // Higher opacity: 0.6-1.0
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }
        }

        linesRef.current = lines;
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

            linesRef.current.forEach((line) => {
                // Calculate distance from mouse
                const dx = line.x - mouseRef.current.x;
                const dy = line.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const repelRadius = 120;

                // Horizontal repel from cursor
                let offsetX = 0;
                if (distance < repelRadius && distance > 0) {
                    const force = (repelRadius - distance) / repelRadius;
                    offsetX = (dx / distance) * force * 80;
                }

                // Move down continuously
                line.y += line.speed;

                // Reset to top when reaching bottom
                if (line.y > dimensions.height + 50) {
                    line.y = -50;
                    line.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
                    line.color = colors[Math.floor(Math.random() * colors.length)];
                }

                // Draw the code line
                ctx.font = `${line.size}px 'Consolas', 'Monaco', 'Courier New', monospace`;
                ctx.fillStyle = line.color;
                ctx.globalAlpha = line.opacity;

                // Add glow effect
                ctx.shadowColor = line.color;
                ctx.shadowBlur = 8;

                ctx.fillText(line.text, line.x + offsetX, line.y);

                // Reset shadow
                ctx.shadowBlur = 0;
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

import { useEffect, useRef } from 'react';

export default function Particles({ theme }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let particles = [];
        const particleCount = 40;

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    s: Math.random() * 2,
                    dy: Math.random() * 0.5 + 0.1,
                    a: Math.random() * 0.5
                });
            }
        };
        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let color = '59, 130, 246'; // Default Blue
            if (theme === 'papyrus') color = '139, 90, 43';
            if (theme === 'dusk') color = '165, 180, 252'; // Indigo

            ctx.fillStyle = `rgba(${color}, 0.5)`;

            particles.forEach(p => {
                p.y -= p.dy;
                if (p.y < 0) p.y = canvas.height;
                ctx.globalAlpha = p.a;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            id="particle-canvas"
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-50"
        />
    );
}

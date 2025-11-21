import { ArrowLeft, ArrowRight } from 'lucide-react';
import useScrollDirection from '../hooks/useScrollDirection';
import { useState, useEffect } from 'react';

export default function NavDock({ prevUrl, nextUrl, onNavigate }) {
    const scrollDir = useScrollDirection();
    const [isAtBottom, setIsAtBottom] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100;
            setIsAtBottom(bottom);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isVisible = scrollDir === 'up' || isAtBottom;

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-4 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
                }`}
        >
            <button
                onClick={() => onNavigate(prevUrl)}
                disabled={!prevUrl}
                className={`p-4 rounded-full glass-panel transition-all duration-300 ${prevUrl
                        ? 'hover:bg-white/10 hover:scale-110 text-white shadow-lg shadow-black/20'
                        : 'opacity-30 cursor-not-allowed text-white/50'
                    }`}
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <button
                onClick={() => onNavigate(nextUrl)}
                disabled={!nextUrl}
                className={`p-4 rounded-full glass-panel transition-all duration-300 ${nextUrl
                        ? 'hover:bg-[var(--accent-color)] hover:scale-110 text-white shadow-lg shadow-[var(--accent-color)]/20 border-[var(--accent-color)]/30'
                        : 'opacity-30 cursor-not-allowed text-white/50'
                    }`}
            >
                <ArrowRight className="w-6 h-6" />
            </button>
        </div>
    );
}

import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function NavDock({ prevUrl, nextUrl, onNavigate }) {
    if (!prevUrl && !nextUrl) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-panel px-4 py-3 rounded-full flex items-center gap-6 z-50 shadow-2xl transition-all duration-500">
            <button
                onClick={() => onNavigate(prevUrl)}
                disabled={!prevUrl}
                className="hover:text-[var(--accent-color)] disabled:opacity-30"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            <span
                className="text-[10px] font-bold opacity-50 cursor-pointer hover:opacity-100"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                HAUT
            </span>

            <button
                onClick={() => onNavigate(nextUrl)}
                disabled={!nextUrl}
                className="hover:text-[var(--accent-color)] disabled:opacity-30"
            >
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    );
}

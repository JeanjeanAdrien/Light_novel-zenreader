import { useNavigate } from 'react-router-dom';
import { BookOpen, Library, Sparkles } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none"></div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                <div className="mb-8 inline-flex items-center justify-center p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl animate-fade-in-up">
                    <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                    <span className="text-sm font-medium tracking-widest uppercase text-purple-200">Next Gen Reading</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 animate-fade-in-up delay-100">
                    ZenReader
                </h1>

                <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
                    Experience light novels like never before. AI-powered translation, immersive reading mode, and a library that grows with you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
                    <button
                        onClick={() => navigate('/read')}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span>Start Reading</span>
                        <div className="absolute inset-0 rounded-full bg-white blur-lg opacity-40 group-hover:opacity-60 transition-opacity -z-10"></div>
                    </button>

                    <button
                        onClick={() => navigate('/library')}
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-bold text-lg backdrop-blur-md border border-white/10 transition-all duration-300 flex items-center gap-2 hover:border-white/30"
                    >
                        <Library className="w-5 h-5" />
                        <span>My Library</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-10 left-0 w-full text-center text-white/20 text-xs uppercase tracking-[0.3em] animate-fade-in delay-500">
                Designed for Immersion
            </div>
        </div>
    );
}

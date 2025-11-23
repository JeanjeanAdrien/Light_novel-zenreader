import { Settings, BookOpen, Home, Library, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import useScrollDirection from '../hooks/useScrollDirection';

export default function Header({
    aiEnabled,
    setAiEnabled,
    lang,
    setLang,
    toggleSettings,
    status,
    currentUrl,
    onNavigate
}) {
    const scrollDir = useScrollDirection();
    const navigate = useNavigate();

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-500 ${scrollDir === 'down' ? '-translate-y-full' : 'translate-y-0'
                }`}
        >
            <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">

                {/* Left: Sidebar & Title */}
                <div className="flex items-center gap-4">
                    <Sidebar currentUrl={currentUrl} onNavigate={onNavigate} />

                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white/90 hidden sm:block">ZenReader</span>
                    </div>

                    <div className="hidden md:flex items-center gap-1 ml-4 border-l border-white/10 pl-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Home"
                        >
                            <Home className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate('/library')}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            title="Library"
                        >
                            <Library className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-3">
                    {/* AI Toggle */}
                    <button
                        onClick={() => setAiEnabled(!aiEnabled)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${aiEnabled
                            ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/30 text-[var(--accent-color)]'
                            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                    >
                        <Sparkles className={`w-3 h-3 ${aiEnabled ? 'animate-pulse-custom' : ''}`} />
                        <span>AI {aiEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    {/* Lang Selector */}
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                        disabled={!aiEnabled}
                        style={{ opacity: aiEnabled ? 1 : 0.3 }}
                        className="bg-black/20 text-[10px] uppercase font-bold rounded px-2 py-1 border border-white/10 outline-none focus:border-[var(--accent-color)] cursor-pointer hover:bg-white/5"
                    >
                        <option value="original">Original (EN)</option>
                        <option value="French">Français</option>
                        <option value="Spanish">Español</option>
                        <option value="Japanese">Japonais</option>
                    </select>

                    {/* Settings Toggle */}
                    <button
                        onClick={toggleSettings}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}

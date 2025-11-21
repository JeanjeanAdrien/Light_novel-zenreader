import { Settings, Sparkles } from 'lucide-react';
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

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-500 ${scrollDir === 'down' ? '-translate-y-full' : 'translate-y-0'
                }`}
        >
            <div className="glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">

                {/* Left: Sidebar & Title */}
                <div className="flex items-center gap-4">
                    <Sidebar currentUrl={currentUrl} onNavigate={onNavigate} />
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight hidden md:block">
                            Zen<span className="text-[var(--accent-color)]">Reader</span>
                        </h1>
                        {/* Status Dot */}
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`h-1.5 w-1.5 rounded-full ${status === 'loading' || status === 'streaming' ? 'bg-[var(--accent-color)] animate-pulse' : status === 'cached' ? 'bg-emerald-500' : 'bg-white/20'}`}></div>
                            <span className="text-[9px] uppercase tracking-widest opacity-50">{status}</span>
                        </div>
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

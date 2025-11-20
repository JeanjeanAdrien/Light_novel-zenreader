import { SlidersHorizontal } from 'lucide-react';

export default function Header({
    aiEnabled,
    setAiEnabled,
    lang,
    setLang,
    toggleSettings,
    status
}) {
    return (
        <header className="fixed top-0 w-full z-40 transition-transform duration-500" id="main-header">
            <div className="glass-panel mx-4 mt-4 rounded-2xl px-6 py-3 flex items-center justify-between max-w-5xl mx-auto shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${status === 'loading' || status === 'streaming' ? 'bg-[var(--accent-color)] animate-pulse' : status === 'cached' ? 'bg-emerald-500' : 'bg-[var(--accent-color)]'}`} id="status-dot"></div>
                    <div className="flex flex-col">
                        <h1 className="text-xs font-bold tracking-[0.2em] uppercase opacity-80">ZenReader V8</h1>
                        <span className="text-[10px] opacity-50">React Core</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* AI Toggle */}
                    <label className="inline-flex items-center cursor-pointer mr-2 group" title="Activer/Désactiver la traduction IA">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={aiEnabled}
                            onChange={(e) => setAiEnabled(e.target.checked)}
                        />
                        <div className="relative w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/50 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent-color)]"></div>
                        <span className="ms-2 text-[9px] font-bold uppercase opacity-50 group-hover:opacity-100 transition-opacity">AI</span>
                    </label>

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

                    <button onClick={toggleSettings} className="p-2 rounded-lg hover:bg-white/10">
                        <SlidersHorizontal className="w-4 h-4 opacity-70" />
                    </button>
                </div>
            </div>
        </header>
    );
}

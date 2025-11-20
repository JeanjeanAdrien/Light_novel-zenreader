export default function SettingsPanel({
    isOpen,
    theme,
    setTheme,
    warmth,
    setWarmth,
    fontSize,
    setFontSize
}) {
    return (
        <div
            className={`fixed top-24 right-4 w-72 glass-panel rounded-2xl p-6 z-50 transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
        >
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50">Atmosphère</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
                <button onClick={() => setTheme('void')} className={`p-2 rounded border hover:bg-white/5 text-[9px] uppercase ${theme === 'void' ? 'border-[var(--accent-color)]' : 'border-white/5'}`}>Void</button>
                <button onClick={() => setTheme('papyrus')} className={`p-2 rounded border hover:bg-white/5 text-[9px] uppercase text-[#f3e5ab] ${theme === 'papyrus' ? 'border-[var(--accent-color)]' : 'border-white/5'}`}>Papyrus</button>
                <button onClick={() => setTheme('synth')} className={`p-2 rounded border hover:bg-white/5 text-[9px] uppercase text-[#00ff9d] ${theme === 'synth' ? 'border-[var(--accent-color)]' : 'border-white/5'}`}>Synth</button>
                <button onClick={() => setTheme('dusk')} className={`p-2 rounded border hover:bg-white/5 text-[9px] uppercase text-[#a5b4fc] ${theme === 'dusk' ? 'border-[var(--accent-color)]' : 'border-white/5'}`}>Dusk</button>
            </div>

            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50">Confort</h3>
            <input
                type="range" min="0" max="80"
                value={warmth}
                onChange={(e) => setWarmth(e.target.value)}
                className="w-full h-1 bg-white/10 rounded appearance-none accent-orange-500 mb-6"
            />

            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50">Taille</h3>
            <input
                type="range" min="14" max="28"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full h-1 bg-white/10 rounded appearance-none accent-[var(--accent-color)]"
            />
        </div>
    );
}

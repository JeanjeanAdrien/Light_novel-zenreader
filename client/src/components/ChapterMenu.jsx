import { useState, useEffect } from 'react';
import { List, X, BookOpen } from 'lucide-react';

export default function ChapterMenu({ currentUrl, onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && chapters.length === 0) {
            setLoading(true);
            fetch(`http://localhost:3000/api/chapters?currentUrl=${encodeURIComponent(currentUrl)}`)
                .then(res => res.json())
                .then(data => {
                    setChapters(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isOpen, currentUrl, chapters.length]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Liste des chapitres"
            >
                <List className="w-4 h-4 opacity-70" />
            </button>

            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <div
                className={`fixed top-4 right-4 bottom-4 w-80 glass-panel rounded-2xl z-[60] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col shadow-2xl border border-white/10 ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-[20%] opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-[var(--accent-color)]" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Chapitres</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-50">
                            <div className="w-4 h-4 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] uppercase tracking-widest">Chargement...</span>
                        </div>
                    ) : chapters.length === 0 ? (
                        <div className="text-center py-20 opacity-30 text-[10px] uppercase tracking-widest">
                            Aucun chapitre en cache
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {chapters.map((chapter) => (
                                <li key={chapter.id}>
                                    <button
                                        onClick={() => {
                                            onNavigate(chapter.url);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${currentUrl === chapter.url
                                                ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/20'
                                                : 'hover:bg-white/5 text-white/70 hover:text-white'
                                            }`}
                                    >
                                        <span className="line-clamp-1 font-medium">{chapter.title}</span>
                                        {currentUrl === chapter.url && (
                                            <span className="text-[9px] uppercase tracking-widest opacity-70 mt-1 block">Lecture en cours</span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 text-center">
                    <span className="text-[9px] opacity-30 uppercase tracking-widest">ZenReader V8</span>
                </div>
            </div>
        </>
    );
}

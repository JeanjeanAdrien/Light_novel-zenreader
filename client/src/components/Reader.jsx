import { useEffect, useRef } from 'react';

export default function Reader({ content, meta, isLoading, isStreaming, error, fontSize }) {
    const contentRef = useRef(null);

    // Auto-scroll to bottom during streaming if user is near bottom? 
    // Actually, original behavior was just append.

    return (
        <main className="relative z-10 pt-32 pb-40 min-h-screen px-6 md:px-12 transition-all duration-500">
            <div className="max-w-2xl mx-auto">

                {/* Header Info */}
                <div className={`text-center mb-12 transition-opacity duration-700 ${meta ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-[9px] font-bold tracking-widest uppercase mb-6">
                        <span>{meta?.title?.match(/Chapter\s+(\d+)/i)?.[1] ? `CH.${meta.title.match(/Chapter\s+(\d+)/i)[1]}` : 'CHARGEMENT...'}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-semibold leading-tight mb-6">{meta?.title}</h2>
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent mx-auto opacity-30"></div>
                </div>

                {/* Text Content */}
                <article
                    ref={contentRef}
                    className="text-lg prose-content min-h-[20vh] pb-10"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <span className="ai-loader"></span>
                            <p className="mt-4 text-[10px] font-mono tracking-widest opacity-50 animate-pulse">CONNEXION NEURONALE...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-center p-4 border border-red-500/30 rounded bg-red-500/10">
                            Erreur: {error}
                        </div>
                    )}

                    {content.map((chunk, idx) => (
                        <div
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: chunk.html }}
                            className="animate-fade-slide-up"
                        />
                    ))}
                </article>

                {/* Streaming Indicator */}
                {isStreaming && (
                    <div className="flex flex-col items-center justify-center py-8 transition-opacity duration-500">
                        <div className="stream-cursor">
                            <div className="pulse-dot"></div>
                            <span>TRADUCTION EN COURS...</span>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}

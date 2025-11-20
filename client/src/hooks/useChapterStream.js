import { useState, useRef, useCallback } from 'react';

export function useChapterStream() {
    const [content, setContent] = useState([]);
    const [meta, setMeta] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const loadChapter = useCallback(async (url, lang, aiEnabled) => {
        if (!url) return;

        // Reset state
        setContent([]);
        setMeta(null);
        setIsLoading(true);
        setIsStreaming(false);
        setError(null);

        // Abort previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            const effectiveLang = aiEnabled ? lang : 'original';

            // Check cache first
            const cacheKey = `zen_cache_${btoa(url).slice(-20)}_${effectiveLang}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { meta, html } = JSON.parse(cached);
                setMeta(meta);
                setContent([{ html }]); // Treat cached HTML as a single chunk
                setIsLoading(false);
                return;
            }

            const apiUrl = `http://localhost:3000/api/chapter?url=${encodeURIComponent(url)}&lang=${effectiveLang}`;
            const response = await fetch(apiUrl, { signal: abortControllerRef.current.signal });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullHtml = '';
            let metaData = null;

            setIsLoading(false);
            setIsStreaming(true);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.type === 'meta') {
                            setMeta(data);
                            metaData = data;
                        } else if (data.type === 'content') {
                            setContent(prev => [...prev, data]);
                            fullHtml += data.html;
                        }
                    } catch (e) { console.error(e); }
                }
            }

            setIsStreaming(false);

            // Cache result
            if (metaData && fullHtml.length > 100) {
                // Clear old cache
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith('zen_cache_')) localStorage.removeItem(k);
                });

                localStorage.setItem(cacheKey, JSON.stringify({
                    meta: metaData,
                    html: fullHtml,
                    timestamp: Date.now()
                }));
            }

        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message);
                setIsLoading(false);
                setIsStreaming(false);
            }
        }
    }, []);

    return { content, meta, isLoading, isStreaming, error, loadChapter };
}

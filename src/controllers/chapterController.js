import { scrapeChapter } from '../services/scraper.js';
import { translateBatch } from '../services/translator.js';

export async function getChapter(req, res) {
    const { url, lang } = req.query;
    if (!url) return res.status(400).json({ error: "URL manquante" });

    console.log(`📚 Flux demandé: ${url} -> ${lang}`);

    // Configuration des headers pour le streaming
    res.setHeader('Content-Type', 'application/x-ndjson'); // Newline Delimited JSON
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // 1. SCRAPING (Rapide)
        const data = await scrapeChapter(url);

        // 2. ENVOI DES METADONNÉES (Immédiat)
        res.write(JSON.stringify({
            type: 'meta',
            title: data.title,
            next: data.next,
            prev: data.prev,
            totalParagraphs: data.paragraphs.length
        }) + "\n");

        // 3. STREAMING DE LA TRADUCTION
        if (lang && lang !== 'original' && lang !== 'en') {
            const BATCH_SIZE = 8;

            for (let i = 0; i < data.paragraphs.length; i += BATCH_SIZE) {
                const chunk = data.paragraphs.slice(i, i + BATCH_SIZE);

                try {
                    const translatedChunk = await translateBatch(chunk, lang);

                    res.write(JSON.stringify({
                        type: 'content',
                        html: translatedChunk.map(p => `<p>${p}</p>`).join('')
                    }) + "\n");

                } catch (err) {
                    // En cas d'erreur sur un chunk, on envoie l'original
                    res.write(JSON.stringify({
                        type: 'content',
                        html: chunk.map(p => `<p style="opacity:0.7">${p}</p>`).join('')
                    }) + "\n");
                }
            }
        } else {
            // Pas de traduction, on envoie tout
            res.write(JSON.stringify({
                type: 'content',
                html: data.paragraphs.map(p => `<p>${p}</p>`).join('')
            }) + "\n");
        }

        res.end();

    } catch (error) {
        console.error("❌ Erreur:", error.message);
        res.write(JSON.stringify({ type: 'error', message: error.message }) + "\n");
        res.end();
    }
}

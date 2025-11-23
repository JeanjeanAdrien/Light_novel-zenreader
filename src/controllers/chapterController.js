import { scrapeChapter } from '../services/scraper.js';
import { translateBatch } from '../services/translator.js';
import { ChapterRepository } from '../repositories/chapterRepository.js';

const chapterRepo = new ChapterRepository();

export async function getChapter(req, res) {
    const { url, lang } = req.query;
    if (!url) return res.status(400).json({ error: "URL manquante" });

    console.log(`📚 Flux demandé: ${url} -> ${lang}`);

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // 1. CHECK DB
        let chapterId = null;
        const cachedChapter = await chapterRepo.findByUrl(url);

        if (cachedChapter) {
            chapterId = cachedChapter.id;
            console.log("💾 Chapitre trouvé en BDD");

            // Si demande original ou langue source
            if (!lang || lang === 'original' || lang === 'en') {
                const content = JSON.parse(cachedChapter.content);

                res.write(JSON.stringify({
                    type: 'meta',
                    title: cachedChapter.title,
                    next: cachedChapter.next,
                    prev: cachedChapter.prev,
                    totalParagraphs: content.length
                }) + "\n");

                res.write(JSON.stringify({
                    type: 'content',
                    html: content.map(p => `<p>${p}</p>`).join('')
                }) + "\n");

                return res.end();
            }

            // Si demande traduction
            const cachedTranslation = await chapterRepo.findTranslation(chapterId, lang);
            if (cachedTranslation) {
                console.log(`💾 Traduction (${lang}) trouvée en BDD`);
                const content = JSON.parse(cachedTranslation.content);

                res.write(JSON.stringify({
                    type: 'meta',
                    title: cachedChapter.title,
                    next: cachedChapter.next,
                    prev: cachedChapter.prev,
                    totalParagraphs: content.length
                }) + "\n");

                res.write(JSON.stringify({
                    type: 'content',
                    html: content.map(p => `<p>${p}</p>`).join('')
                }) + "\n");

                return res.end();
            }
        }

        // 2. SCRAPING (Si pas en BDD ou traduction manquante)
        let data;
        if (cachedChapter) {
            data = {
                title: cachedChapter.title,
                paragraphs: JSON.parse(cachedChapter.content),
                next: cachedChapter.next,
                prev: cachedChapter.prev
            };
        } else {
            console.log("🌐 Scraping en cours...");
            data = await scrapeChapter(url);

            // Save to DB
            chapterId = await chapterRepo.create({
                url,
                title: data.title,
                paragraphs: data.paragraphs,
                next: data.next,
                prev: data.prev
            });
            console.log("💾 Nouveau chapitre sauvegardé en BDD");
        }

        // 2b. ENVOI METADONNÉES
        res.write(JSON.stringify({
            type: 'meta',
            title: data.title,
            next: data.next,
            prev: data.prev,
            totalParagraphs: data.paragraphs.length
        }) + "\n");

        // 3. STREAMING & TRADUCTION
        if (lang && lang !== 'original' && lang !== 'en') {
            const BATCH_SIZE = 8;
            let fullTranslatedContent = [];

            for (let i = 0; i < data.paragraphs.length; i += BATCH_SIZE) {
                const chunk = data.paragraphs.slice(i, i + BATCH_SIZE);

                try {
                    const translatedChunk = await translateBatch(chunk, lang);
                    fullTranslatedContent.push(...translatedChunk);

                    res.write(JSON.stringify({
                        type: 'content',
                        html: translatedChunk.map(p => `<p>${p}</p>`).join('')
                    }) + "\n");

                } catch (err) {
                    console.error("Erreur traduction chunk:", err);
                    res.write(JSON.stringify({
                        type: 'content',
                        html: chunk.map(p => `<p style="opacity:0.7">${p}</p>`).join('')
                    }) + "\n");
                }
            }

            // Save translation to DB
            if (fullTranslatedContent.length > 0) {
                await chapterRepo.saveTranslation(chapterId, lang, fullTranslatedContent);
                console.log(`💾 Traduction (${lang}) sauvegardée en BDD`);
            }

        } else {
            // Cas original (déjà géré par le cache check, mais fallback ici si scraping vient de se faire)
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

export async function getChapters(req, res) {
    const { currentUrl } = req.query;
    if (!currentUrl) return res.status(400).json({ error: "URL manquante" });

    try {
        // Extract base URL (simplified logic: match up to /chapter-...)
        // Example: https://novelbin.com/b/novel-name/chapter-1 -> https://novelbin.com/b/novel-name%
        const baseUrlMatch = currentUrl.match(/(.*\/b\/[^\/]+)/);

        console.log(`🔍 Fetching chapters for: ${currentUrl}`);

        if (!baseUrlMatch) {
            console.log("⚠️ No base URL match found");
            return res.json([]);
        }

        const baseUrl = baseUrlMatch[1];
        console.log(`📂 Base URL: ${baseUrl}`);

        const chapters = await chapterRepo.findByBaseUrl(baseUrl);

        console.log(`✅ Found ${chapters.length} chapters`);
        res.json(chapters);
    } catch (error) {
        console.error("❌ Erreur récupération chapitres:", error.message);
        res.status(500).json({ error: error.message });
    }
}

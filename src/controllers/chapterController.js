import { scrapeChapter } from '../services/scraper.js';
import { translateBatch } from '../services/translator.js';
import { getDb } from '../db/index.js';

export async function getChapter(req, res) {
    const { url, lang } = req.query;
    if (!url) return res.status(400).json({ error: "URL manquante" });

    console.log(`📚 Flux demandé: ${url} -> ${lang}`);

    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const db = await getDb();

        // 1. CHECK DB
        let chapterId = null;
        const cachedChapter = await db.get('SELECT * FROM chapters WHERE url = ?', url);

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
            const cachedTranslation = await db.get('SELECT * FROM translations WHERE chapter_id = ? AND lang = ?', [chapterId, lang]);
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
            const result = await db.run(
                'INSERT INTO chapters (url, title, content, next, prev) VALUES (?, ?, ?, ?, ?)',
                [url, data.title, JSON.stringify(data.paragraphs), data.next, data.prev]
            );
            chapterId = result.lastID;
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
                await db.run(
                    'INSERT INTO translations (chapter_id, lang, content) VALUES (?, ?, ?)',
                    [chapterId, lang, JSON.stringify(fullTranslatedContent)]
                );
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
        const db = await getDb();

        // Extract base URL (simplified logic: match up to /chapter-...)
        // Example: https://novelbin.com/b/novel-name/chapter-1 -> https://novelbin.com/b/novel-name%
        // Fix: Handle URLs that might not match the exact pattern or have query params
        // We'll try to match the /b/novel-name part more robustly
        const baseUrlMatch = currentUrl.match(/(.*\/b\/[^\/]+)/);

        console.log(`🔍 Fetching chapters for: ${currentUrl}`);

        if (!baseUrlMatch) {
            console.log("⚠️ No base URL match found");
            return res.json([]);
        }

        const baseUrl = baseUrlMatch[1];
        console.log(`📂 Base URL: ${baseUrl}`);

        const chapters = await db.all(
            'SELECT title, url FROM chapters WHERE url LIKE ? ORDER BY id ASC',
            [`${baseUrl}%`]
        );

        console.log(`✅ Found ${chapters.length} chapters`);
        res.json(chapters);
    } catch (error) {
        console.error("❌ Erreur récupération chapitres:", error.message);
        res.status(500).json({ error: error.message });
    }
}

export async function getBooks(req, res) {
    try {
        const db = await getDb();

        // 1. Get all books from the books table
        const books = await db.all('SELECT * FROM books ORDER BY title ASC');

        // 2. Get reading history (latest chapter for each book)
        // We group by base URL pattern to match chapters to books
        const history = await db.all(`
            SELECT url, title, id, created_at 
            FROM chapters 
            ORDER BY created_at DESC
        `);

        // 3. Map history to books and identify orphans
        const library = books.map(book => {
            // Extract book slug from source_url
            // https://novelbin.com/b/my-vampire-system -> my-vampire-system
            const bookSlug = book.source_url.split('/b/')[1];

            const latestChapter = history.find(ch => ch.url.includes(bookSlug)) || {
                title: "Start Reading",
                url: `${book.source_url}/chapter-1`, // Default to chapter 1
                id: null
            };

            return {
                ...book,
                genres: JSON.parse(book.genres || '[]'),
                tags: JSON.parse(book.tags || '[]'),
                latestChapter,
                isReading: latestChapter.id !== null
            };
        });

        // 4. Handle Orphan Books (in history but not in books table)
        // Group history by book (simple heuristic: first part of URL path after /b/)
        const bookSlugs = new Set(books.map(b => b.source_url.split('/b/')[1]));

        const orphanChapters = history.filter(ch => {
            const match = ch.url.match(/\/b\/([^\/]+)/);
            return match && !bookSlugs.has(match[1]);
        });

        // Group orphans by book slug to avoid duplicates
        const orphanBooksMap = {};
        orphanChapters.forEach(ch => {
            const match = ch.url.match(/\/b\/([^\/]+)/);
            if (match) {
                const slug = match[1];
                if (!orphanBooksMap[slug]) {
                    orphanBooksMap[slug] = {
                        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Capitalize slug
                        source_url: `https://novelbin.com/b/${slug}`,
                        cover_image: null, // No cover for orphans
                        rating: 0,
                        genres: [],
                        tags: [],
                        latestChapter: ch,
                        isReading: true,
                        isOrphan: true
                    };
                } else {
                    // Update if this chapter is newer (history is already sorted DESC)
                    if (new Date(ch.created_at) > new Date(orphanBooksMap[slug].latestChapter.created_at)) {
                        orphanBooksMap[slug].latestChapter = ch;
                    }
                }
            }
        });

        const fullLibrary = [...library, ...Object.values(orphanBooksMap)];

        // 5. Sort: Reading first, then by Rating
        fullLibrary.sort((a, b) => {
            // 1. Reading status (Reading comes first)
            if (a.isReading && !b.isReading) return -1;
            if (!a.isReading && b.isReading) return 1;

            // 2. Rating (Higher rating comes first)
            return (b.rating || 0) - (a.rating || 0);
        });

        console.log(`📚 Sending ${fullLibrary.length} books from library (incl. ${Object.keys(orphanBooksMap).length} orphans)`);
        res.json(fullLibrary);

    } catch (error) {
        console.error("❌ Error fetching books:", error);
        res.status(500).json({ error: error.message });
    }
}

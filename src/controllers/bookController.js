import { BookRepository } from '../repositories/bookRepository.js';
import { ChapterRepository } from '../repositories/chapterRepository.js';

const bookRepo = new BookRepository();
const chapterRepo = new ChapterRepository();

export async function getAllBooks(req, res) {
    try {
        // 1. Get all books
        const books = await bookRepo.findAll();

        // 2. Get reading history
        const history = await chapterRepo.getHistory();

        // 3. Map history to books and identify orphans
        const library = books.map(book => {
            const bookSlug = book.source_url.split('/b/')[1];

            const latestChapter = history.find(ch => ch.url.includes(bookSlug)) || {
                title: "Start Reading",
                url: `${book.source_url}/chapter-1`,
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

        // 4. Handle Orphan Books
        const bookSlugs = new Set(books.map(b => b.source_url.split('/b/')[1]));

        const orphanChapters = history.filter(ch => {
            const match = ch.url.match(/\/b\/([^\/]+)/);
            return match && !bookSlugs.has(match[1]);
        });

        const orphanBooksMap = {};
        orphanChapters.forEach(ch => {
            const match = ch.url.match(/\/b\/([^\/]+)/);
            if (match) {
                const slug = match[1];
                if (!orphanBooksMap[slug]) {
                    orphanBooksMap[slug] = {
                        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        source_url: `https://novelbin.com/b/${slug}`,
                        cover_image: null,
                        rating: 0,
                        genres: [],
                        tags: [],
                        latestChapter: ch,
                        isReading: true,
                        isOrphan: true
                    };
                } else {
                    if (new Date(ch.created_at) > new Date(orphanBooksMap[slug].latestChapter.created_at)) {
                        orphanBooksMap[slug].latestChapter = ch;
                    }
                }
            }
        });

        const fullLibrary = [...library, ...Object.values(orphanBooksMap)];

        // 5. Sort: Reading first, then by Rating
        fullLibrary.sort((a, b) => {
            if (a.isReading && !b.isReading) return -1;
            if (!a.isReading && b.isReading) return 1;
            return (b.rating || 0) - (a.rating || 0);
        });

        console.log(`📚 Sending ${fullLibrary.length} books from library (incl. ${Object.keys(orphanBooksMap).length} orphans)`);
        res.json(fullLibrary);

    } catch (error) {
        console.error("❌ Error fetching books:", error);
        res.status(500).json({ error: error.message });
    }
}

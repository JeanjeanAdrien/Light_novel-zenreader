import { getDb } from '../db/index.js';

export class ChapterRepository {
    async findByUrl(url) {
        const db = await getDb();
        return db.get('SELECT * FROM chapters WHERE url = ?', url);
    }

    async findByBaseUrl(baseUrl) {
        const db = await getDb();
        return db.all(
            'SELECT title, url FROM chapters WHERE url LIKE ? ORDER BY id ASC',
            [`${baseUrl}%`]
        );
    }

    async create(data) {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO chapters (url, title, content, next, prev) VALUES (?, ?, ?, ?, ?)',
            [data.url, data.title, JSON.stringify(data.paragraphs), data.next, data.prev]
        );
        return result.lastID;
    }

    async saveTranslation(chapterId, lang, content) {
        const db = await getDb();
        return db.run(
            'INSERT INTO translations (chapter_id, lang, content) VALUES (?, ?, ?)',
            [chapterId, lang, JSON.stringify(content)]
        );
    }

    async findTranslation(chapterId, lang) {
        const db = await getDb();
        return db.get('SELECT * FROM translations WHERE chapter_id = ? AND lang = ?', [chapterId, lang]);
    }

    async getHistory() {
        const db = await getDb();
        return db.all(`
            SELECT url, title, id, created_at 
            FROM chapters 
            ORDER BY created_at DESC
        `);
    }
}

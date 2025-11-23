import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../src/db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function importBooks() {
    try {
        const db = await getDb();
        const booksPath = path.join(__dirname, '../books.json');

        console.log(`📖 Reading books from ${booksPath}...`);
        const data = await fs.readFile(booksPath, 'utf-8');
        const json = JSON.parse(data);
        const books = json.data;

        console.log(`📚 Found ${books.length} books to import.`);

        let imported = 0;
        let skipped = 0;

        for (const book of books) {
            try {
                // Check if exists
                const existing = await db.get('SELECT id FROM books WHERE source_url = ?', book.link);

                if (existing) {
                    // Update
                    await db.run(`
                        UPDATE books SET 
                        title = ?, author = ?, description = ?, cover_image = ?, 
                        genres = ?, tags = ?, status = ?, rating = ?
                        WHERE source_url = ?
                    `, [
                        book.title,
                        book.author,
                        book.description,
                        book.image,
                        JSON.stringify(book.genres || []),
                        JSON.stringify(book.tags || []),
                        book.status,
                        book.ratingValue,
                        book.link
                    ]);
                    skipped++; // Count as skipped for "new" inserts, but it's an update
                } else {
                    // Insert
                    await db.run(`
                        INSERT INTO books (title, author, description, cover_image, genres, tags, status, rating, source_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        book.title,
                        book.author,
                        book.description,
                        book.image,
                        JSON.stringify(book.genres || []),
                        JSON.stringify(book.tags || []),
                        book.status,
                        book.ratingValue,
                        book.link
                    ]);
                    imported++;
                }
            } catch (err) {
                console.error(`❌ Failed to import ${book.title}:`, err.message);
            }
        }

        console.log(`✅ Import finished: ${imported} new, ${skipped} updated.`);

    } catch (error) {
        console.error("❌ Fatal error:", error);
    }
}

importBooks();

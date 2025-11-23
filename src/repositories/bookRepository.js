import { getDb } from '../db/index.js';

export class BookRepository {
    async findAll() {
        const db = await getDb();
        return db.all('SELECT * FROM books ORDER BY title ASC');
    }
}

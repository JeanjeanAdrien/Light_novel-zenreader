import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance = null;

export async function getDb() {
    if (dbInstance) return dbInstance;

    dbInstance = await open({
        filename: './zenreader.db',
        driver: sqlite3.Database
    });

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            title TEXT,
            content JSON,
            next TEXT,
            prev TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS translations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chapter_id INTEGER,
            lang TEXT,
            content JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(chapter_id) REFERENCES chapters(id),
            UNIQUE(chapter_id, lang)
        );
    `);

    console.log("💾 Database initialized");
    return dbInstance;
}

import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { isDev } from '../../index';
import { v4 } from 'uuid';

// Set the path for the database file
const dbPath: string = isDev
    ? path.join(__dirname, '..', 'database.db') // Development path
    : path.join(app.getPath('userData'), 'database.db'); // Production path

// Connect to the SQLite database
const db = new Database(dbPath, { verbose: console.info });

console.log(`Connected to the database at ${dbPath}`);

/**
 * Create tables if they do not exist [Database Schem](../docs/database-schema.md)
 */
export function createTablesIfNotExists(): void {
    try {
        // User Table
        db.prepare(
            `
        CREATE TABLE IF NOT EXISTS user (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          createdAt DATE,
          lastAuth DATE
        )
      `
        ).run();

        // Event Logger Table
        db.prepare(
            `
        CREATE TABLE IF NOT EXISTS eventLogger (
          id TEXT PRIMARY KEY,
          iat DATE,
          type TEXT,
          value TEXT
        )
      `
        ).run();

        // Groups Table
        db.prepare(
            `
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          year TEXT,
          userId TEXT,
          createdAt DATE DEFAULT (datetime('now')),
          updatedAt DATE DEFAULT NULL,
          parentId TEXT DEFAULT NULL,
          FOREIGN KEY (userId) REFERENCES user(id),
          FOREIGN KEY (parentId) REFERENCES courses(id)
        )
      `
        ).run();

        // Courses Table
        db.prepare(
            `
        CREATE TABLE IF NOT EXISTS courses (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          year TEXT,
          userId TEXT,
          createdAt DATE DEFAULT (datetime('now')),
          updatedAt DATE DEFAULT NULL,
          FOREIGN KEY (userId) REFERENCES user(id)
        )
      `
        ).run();

        // Directories Table
        db.prepare(
            `
        CREATE TABLE IF NOT EXISTS directories (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          parentId TEXT,
          userId TEXT,
          favorite BOOLEAN DEFAULT FALSE,
          createdAt DATE DEFAULT (datetime('now')),
          updatedAt DATE DEFAULT NULL,
          courseId TEXT DEFAULT NULL,
          FOREIGN KEY (courseid) REFERENCES courses(id),
          FOREIGN KEY (parentId) REFERENCES directories(id) ON DELETE SET NULL,
          FOREIGN KEY (userId) REFERENCES user(id)
        )
      `
        ).run();

        // Files Table
        db.prepare(
            `
        CREATE TABLE IF NOT EXISTS files (
          id TEXT PRIMARY KEY,
          name TEXT,
          parentId TEXT,
		  type TEXT,
		  variant TEXT DEFAULT NULL,
          userId TEXT,
		  courseId TEXT DEFAULT NULL,
          createdAt DATE DEFAULT (datetime('now')),
          updatedAt DATE DEFAULT NULL,
		  FOREIGN KEY (courseid) REFERENCES courses(id),
          FOREIGN KEY (parentId) REFERENCES directories(id) ON DELETE SET NULL,
          FOREIGN KEY (userId) REFERENCES user(id)
        )
      `
        ).run();
    } catch (error: any) {
        console.error(`Error creating tables: ${error.message}`);
    }
}

/**
 * Create a user if it does not exist
 * @param email - The email of the user
 */
export const createUserIfNotExists = (email: string): string | null => {
    try {
        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);

        let newuserId = v4();

        if (!user) {
            db.prepare('INSERT INTO user (id, email) VALUES (?, ?)').run(newuserId, email);
            console.log('Inserted user: ', email);
        }

        return newuserId;
    } catch (error: any) {
        console.error('Error creating user: ', error);
        return null;
    }
};

/**
 * Drop all tables
 */
export const dropAllTables = () => {
    try {
        // Disable foreign key constraint checking
        db.exec('PRAGMA foreign_keys = OFF;');

        // Drop tables
        db.prepare('DROP TABLE IF EXISTS user').run();
        db.prepare('DROP TABLE IF EXISTS groups').run();
        db.prepare('DROP TABLE IF EXISTS courses').run();
        db.prepare('DROP TABLE IF EXISTS directories').run();
        db.prepare('DROP TABLE IF EXISTS files').run();
        db.prepare('DROP TABLE IF EXISTS eventLogger').run();

        // Re-enable foreign key constraints
        db.exec('PRAGMA foreign_keys = ON;');
    } catch (error: any) {
        console.error('Error dropping tables: ', error);
    } finally {
        createTablesIfNotExists();
    }
};

export default db;

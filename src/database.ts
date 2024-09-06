import path from "path";
import { app } from "electron";
import Database from "better-sqlite3";

// Determine if the app is in development mode
const isDev: boolean = process.env.NODE_ENV === "development";

// Set the path for the database file
const dbPath: string = isDev
  ? path.join(__dirname, "..", "database.db") // Development path
  : path.join(app.getPath("userData"), "database.db"); // Production path

// Connect to the SQLite database
const db = new Database(dbPath, { verbose: console.log });

console.log(`Connected to the database at ${dbPath}`);

/**
 * Create tables if they do not exist [Database Schem](../docs/database-schema.md)
 */
export function createTablesIfNotExists(): void {
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
        value TEXT  -- storing JSON as a string
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
        userid TEXT,
        createdAt DATE DEFAULT (datetime('now')),
        updatedAt DATE DEFAULT NULL,
        parentId TEXT DEFAULT NULL,
        FOREIGN KEY (userid) REFERENCES user(id)
        FOREIGN KEY (parentId) REFERENCES courses(id),
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
        userid TEXT,
        createdAt DATE DEFAULT (datetime('now')),
        updatedAt DATE DEFAULT NULL,
        FOREIGN KEY (userid) REFERENCES user(id)
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
        userid TEXT,
        createdAt DATE DEFAULT (datetime('now')),
        updatedAt DATE DEFAULT NULL,
        FOREIGN KEY (parentId) REFERENCES courses(id),
        FOREIGN KEY (userid) REFERENCES user(id)
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
        userid TEXT,
        createdAt DATE DEFAULT (datetime('now')),
        updatedAt DATE DEFAULT NULL,
        FOREIGN KEY (parentId) REFERENCES courses(id),  -- or directories(id)
        FOREIGN KEY (userid) REFERENCES user(id)
      )
    `
  ).run();
}

export default db;

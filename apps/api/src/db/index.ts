import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'

const DB_PATH = process.env.DATABASE_URL ?? './data/promotions.db'
const absolutePath = path.resolve(DB_PATH)

const sqlite = new Database(absolutePath)

sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      website_url TEXT,
      hours TEXT,
      social_links TEXT NOT NULL DEFAULT '{}',
      portal TEXT NOT NULL,
      scraped_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL REFERENCES brands(id),
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      start_date TEXT,
      end_date TEXT,
      canonical_url TEXT NOT NULL,
      portal TEXT NOT NULL,
      scraped_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_promotions_brand_id ON promotions(brand_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);
    CREATE INDEX IF NOT EXISTS idx_promotions_scraped_at ON promotions(scraped_at);
  `)
}

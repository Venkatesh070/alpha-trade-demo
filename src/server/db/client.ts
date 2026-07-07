import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "mysql2/promise";
import type Database from "better-sqlite3";
import { loadServerEnv } from "@/server/load-env";

export type DbDialect = "mysql" | "sqlite";

export interface DbExecResult {
  changes?: number;
}

export interface SqlDatabase {
  dialect: DbDialect;
  query<T extends Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  execute(sql: string, params?: unknown[]): Promise<DbExecResult>;
  close(): Promise<void>;
}

let dbInstance: SqlDatabase | null = null;
let migratePromise: Promise<void> | null = null;

function projectRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    if (existsSync(resolve(dir, "package.json"))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

function migrationSql(): string {
  const path = resolve(projectRoot(), "migrations/001_sessions.sql");
  return readFileSync(path, "utf8");
}

function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));
}

class MysqlDatabase implements SqlDatabase {
  dialect: DbDialect = "mysql";

  constructor(private pool: Pool) {}

  async query<T extends Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<DbExecResult> {
    const [result] = await this.pool.execute(sql, params);
    const header = result as { affectedRows?: number };
    return { changes: header.affectedRows };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class SqliteDatabase implements SqlDatabase {
  dialect: DbDialect = "sqlite";

  constructor(private db: Database.Database) {}

  async query<T extends Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(...params) as T[];
  }

  async execute(sql: string, params: unknown[] = []): Promise<DbExecResult> {
    const result = this.db.prepare(sql).run(...params);
    return { changes: result.changes };
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

async function createMysqlDatabase(url: string): Promise<SqlDatabase> {
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool(url);
  return new MysqlDatabase(pool);
}

async function createMysqlDatabaseFromEnv(): Promise<SqlDatabase | null> {
  const host = process.env.MYSQL_HOST?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const database = process.env.MYSQL_DATABASE?.trim();
  if (!host || !user || !database) return null;

  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({
    host,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user,
    password: process.env.MYSQL_PASSWORD ?? "",
    database,
    waitForConnections: true,
    connectionLimit: 10,
  });
  return new MysqlDatabase(pool);
}

async function createSqliteDatabase(filePath: string): Promise<SqlDatabase> {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const BetterSqlite3 = (await import("better-sqlite3")).default;
  const db = new BetterSqlite3(filePath);
  db.pragma("journal_mode = WAL");
  return new SqliteDatabase(db);
}

export async function getDatabase(): Promise<SqlDatabase> {
  if (dbInstance) return dbInstance;

  loadServerEnv();
  const url = process.env.DATABASE_URL?.trim();

  if (url?.startsWith("mysql://") || url?.startsWith("mysql2://")) {
    dbInstance = await createMysqlDatabase(url.replace(/^mysql2:\/\//, "mysql://"));
  } else if (url?.startsWith("sqlite:")) {
    const file = url.replace(/^sqlite:/, "");
    dbInstance = await createSqliteDatabase(resolve(file));
  } else {
    const fromEnv = await createMysqlDatabaseFromEnv();
    if (fromEnv) {
      console.info("[db] Using MySQL from MYSQL_* environment variables.");
      dbInstance = fromEnv;
    } else {
      const fallback = resolve(projectRoot(), "data/exness-sessions.db");
      console.warn(`[db] No DATABASE_URL or MYSQL_* vars — using SQLite at ${fallback}`);
      dbInstance = await createSqliteDatabase(fallback);
    }
  }

  await runMigrations(dbInstance);
  return dbInstance;
}

export async function runMigrations(db: SqlDatabase): Promise<void> {
  if (!migratePromise) {
    migratePromise = (async () => {
      const statements = splitStatements(migrationSql());
      for (const statement of statements) {
        await db.execute(statement);
      }
    })();
  }
  await migratePromise;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    migratePromise = null;
  }
}

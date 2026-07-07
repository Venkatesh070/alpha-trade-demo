import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "mysql2/promise";
import { loadServerEnv } from "@/server/load-env";
import { SESSION_MIGRATION_SQL } from "@/server/db/session-migration-sql";

export type DbDialect = "mysql";

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

function migrationSql(): string {
  const candidates = [resolve(process.cwd(), "migrations/001_sessions.sql")];

  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 10; i++) {
    candidates.push(resolve(dir, "migrations/001_sessions.sql"));
    dir = dirname(dir);
  }

  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path, "utf8");
    }
  }

  return SESSION_MIGRATION_SQL;
}

function stripLeadingComments(sql: string): string {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .trim();
}

function splitStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => stripLeadingComments(s))
    .filter((s) => s.length > 0);
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

function resolveMysqlConfig():
  | { mode: "url"; url: string }
  | { mode: "env"; host: string; port: number; user: string; password: string; database: string }
  | null {
  loadServerEnv();

  const url = process.env.DATABASE_URL?.trim();
  if (url?.startsWith("mysql://") || url?.startsWith("mysql2://")) {
    return { mode: "url", url: url.replace(/^mysql2:\/\//, "mysql://") };
  }

  const host = process.env.MYSQL_HOST?.trim();
  const user = process.env.MYSQL_USER?.trim();
  const database = process.env.MYSQL_DATABASE?.trim();
  if (!host || !user || !database) return null;

  return {
    mode: "env",
    host,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user,
    password: process.env.MYSQL_PASSWORD ?? "",
    database,
  };
}

async function createMysqlDatabase(): Promise<SqlDatabase> {
  const config = resolveMysqlConfig();
  if (!config) {
    throw new Error(
      "MySQL is not configured. Set DATABASE_URL or MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE in .env.",
    );
  }

  const mysql = await import("mysql2/promise");
  const pool =
    config.mode === "url"
      ? mysql.createPool(config.url)
      : mysql.createPool({
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.database,
          waitForConnections: true,
          connectionLimit: 10,
        });

  return new MysqlDatabase(pool);
}

export async function getDatabase(): Promise<SqlDatabase> {
  if (dbInstance) return dbInstance;

  const db = await createMysqlDatabase();
  try {
    await runMigrations(db);
    dbInstance = db;
    return dbInstance;
  } catch (err) {
    await db.close();
    migratePromise = null;
    throw err;
  }
}

export async function runMigrations(db: SqlDatabase): Promise<void> {
  if (!migratePromise) {
    migratePromise = (async () => {
      const statements = splitStatements(migrationSql());
      for (const statement of statements) {
        try {
          await db.execute(statement);
        } catch (err) {
          console.error("[db] Migration failed:", statement.slice(0, 80), err);
          migratePromise = null;
          throw err;
        }
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

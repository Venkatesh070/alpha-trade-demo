import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

let loaded = false;

function findProjectRoot(): string | undefined {
  const candidates = new Set<string>([process.cwd()]);

  if (typeof import.meta.url === "string") {
    let dir = dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 8; i++) {
      candidates.add(dir);
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  for (const dir of candidates) {
    if (existsSync(resolve(dir, "package.json")) && existsSync(resolve(dir, ".output"))) {
      return dir;
    }
  }

  return process.cwd();
}

/** Load `.env` from the project root for production (PM2 / node start). */
export function loadServerEnv(): void {
  if (loaded) return;
  loaded = true;

  const root = findProjectRoot();
  const envPath = resolve(root, ".env");
  if (existsSync(envPath)) {
    config({ path: envPath });
  } else {
    console.warn(`[load-env] No .env file at ${envPath} (cwd=${process.cwd()})`);
  }

  // Fall back to backend/.env for shared MySQL credentials (GoDaddy cPanel).
  const backendEnvPath = resolve(root, "backend/.env");
  if (existsSync(backendEnvPath)) {
    config({ path: backendEnvPath });
  }

  if (!process.env.FIREBASE_PRIVATE_KEY?.includes("BEGIN PRIVATE KEY") && existsSync(envPath)) {
    const fromFile = readPrivateKeyFromEnvFile(envPath);
    if (fromFile) {
      process.env.FIREBASE_PRIVATE_KEY = fromFile;
    }
  }
}

function readPrivateKeyFromEnvFile(envPath: string): string | undefined {
  try {
    const raw = readFileSync(envPath, "utf8");
    const quoted = raw.match(/^FIREBASE_PRIVATE_KEY=(?:"([^"]*)"|'([^']*)')/m);
    const inline = quoted?.[1] ?? quoted?.[2];
    if (inline?.includes("BEGIN PRIVATE KEY")) {
      return inline.replace(/\\n/g, "\n");
    }

    const multiline = raw.match(
      /^FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\r?\n([\s\S]*?)\r?\n-----END PRIVATE KEY-----/m,
    );
    if (multiline) {
      return `-----BEGIN PRIVATE KEY-----\n${multiline[1]}\n-----END PRIVATE KEY-----\n`;
    }
  } catch {
    // ignore
  }
  return undefined;
}

loadServerEnv();

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

let loaded = false;

/** Load `.env` from the project root for production (PM2 / node start). */
export function loadServerEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  config({ path: envPath });
}

loadServerEnv();

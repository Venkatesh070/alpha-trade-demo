import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  // Load native/server deps from node_modules at runtime (do not bundle).
  traceDeps: ["firebase-admin*", "mysql2*"],
});

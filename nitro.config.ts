import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  // Nitro v3 bundles deps by default; firebase-admin must load from node_modules at runtime.
  traceDeps: ["firebase-admin*"],
});

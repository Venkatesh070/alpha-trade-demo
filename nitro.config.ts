import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  traceDeps: ["firebase-admin*"],
});

/** @deprecated Admin sessions are stored in SQL — use session-api.ts */
export {
  clearLegacyBrowserSessionKeys as clearLegacyAdminLocalStorage,
} from "@/lib/session-api";

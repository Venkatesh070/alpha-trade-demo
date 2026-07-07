/** Backend API base — all client requests go to exness-india-server. */
export function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured?.trim()) return configured.replace(/\/$/, "");
  return "http://localhost:4000";
}

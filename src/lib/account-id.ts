/** Fallback for legacy sessions before accountId was stored server-side. */
export function accountIdFromEmail(email?: string): string {
  if (!email) return "104835621";
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return String(100_000_000 + (hash % 900_000_000));
}

export function getAccountId(user?: { accountId?: string; email?: string } | null): string {
  if (user?.accountId?.trim()) return user.accountId;
  return accountIdFromEmail(user?.email);
}

export function formatAccountId(user?: { accountId?: string; email?: string } | null): string {
  return getAccountId(user);
}

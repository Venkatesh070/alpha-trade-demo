/** Deterministic 8-digit trading account number from the user's email. */
export function accountIdFromEmail(email?: string): string {
  if (!email) return "10483562";
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return String(10_000_000 + (hash % 90_000_000));
}

export function formatAccountId(email?: string): string {
  return accountIdFromEmail(email);
}

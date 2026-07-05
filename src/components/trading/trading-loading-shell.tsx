/** Placeholder while the trading terminal hydrates on the client. */
export function TradingLoadingShell() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--gold)] border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading terminal…</p>
      </div>
    </div>
  );
}

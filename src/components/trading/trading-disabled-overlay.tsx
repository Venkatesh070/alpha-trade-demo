import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MIN_TRADING_BALANCE } from "@/hooks/use-wallet";

export function TradingDisabledOverlay({ balance }: { balance: number }) {
  const shortfall = Math.max(0, MIN_TRADING_BALANCE - balance);

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/75 backdrop-blur-[2px]">
      <div className="mx-4 max-w-md rounded-2xl border border-border/80 bg-surface/95 p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gold)]/15">
          <Lock className="h-6 w-6 text-[color:var(--gold)]" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold">Trading unavailable</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Deposit ₹{MIN_TRADING_BALANCE.toLocaleString()} to unlock live prices and trading. You can
          still browse symbols in the market list.
        </p>
        <p className="mt-3 font-mono text-sm">
          Balance:{" "}
          <span className="text-[color:var(--destructive)]">₹{balance.toLocaleString()}</span>
          {shortfall > 0 && (
            <span className="text-muted-foreground">
              {" "}
              · ₹{shortfall.toLocaleString()} more needed
            </span>
          )}
        </p>
        <Button asChild className="gold-button hover:gold-button-hover mt-5 w-full">
          <Link to="/app/wallet/deposit">Deposit funds</Link>
        </Button>
      </div>
    </div>
  );
}

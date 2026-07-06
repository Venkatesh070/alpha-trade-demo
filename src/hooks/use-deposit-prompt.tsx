import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Lock } from "lucide-react";
import { DEPOSIT_UNLOCK_MESSAGE, DepositButton, WithdrawButton } from "@/components/pricing/price-gate";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MIN_TRADING_BALANCE, useWallet } from "@/hooks/use-wallet";

interface DepositPromptCtx {
  openDepositPrompt: (feature?: string) => void;
  closeDepositPrompt: () => void;
}

const DepositPromptContext = createContext<DepositPromptCtx | null>(null);

export function DepositPromptProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | undefined>();
  const { balance } = useWallet();

  const openDepositPrompt = useCallback((featureName?: string) => {
    setFeature(featureName);
    setOpen(true);
  }, []);

  const closeDepositPrompt = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openDepositPrompt, closeDepositPrompt }),
    [openDepositPrompt, closeDepositPrompt],
  );

  const shortfall = Math.max(0, MIN_TRADING_BALANCE - balance);

  return (
    <DepositPromptContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-[color:var(--gold)]/25 sm:rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gold)]/15">
              <Lock className="h-6 w-6 text-[color:var(--gold)]" />
            </div>
            <DialogTitle className="text-center font-display text-xl">
              {feature ? `${feature} is locked` : "Deposit to unlock"}
            </DialogTitle>
            <DialogDescription className="text-center leading-relaxed">
              {DEPOSIT_UNLOCK_MESSAGE}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-xl border border-border/60 bg-surface/50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Current balance</span>
              <span className="font-mono font-semibold tabular-nums">
                ₹{balance.toLocaleString("en-IN")}
              </span>
            </div>
            {shortfall > 0 && (
              <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-2">
                <span className="text-muted-foreground">Minimum to unlock</span>
                <span className="font-mono font-semibold tabular-nums text-[color:var(--gold-deep)] dark:text-[color:var(--gold)]">
                  ₹{MIN_TRADING_BALANCE.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-center">
            <Button type="button" variant="outline" onClick={closeDepositPrompt}>
              Not now
            </Button>
            <DepositButton size="default" label="Deposit funds" className="h-10" />
            <WithdrawButton size="default" className="h-10" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DepositPromptContext.Provider>
  );
}

export function useDepositPrompt() {
  const ctx = useContext(DepositPromptContext);
  if (!ctx) throw new Error("useDepositPrompt must be used within DepositPromptProvider");
  return ctx;
}

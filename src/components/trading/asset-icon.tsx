import type { Asset } from "@/data/markets";
import { cn } from "@/lib/utils";

export function terminalSymbol(symbol: string) {
  return symbol.replace("/", "");
}

function GoldBarsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="4" y="14" width="24" height="6" rx="1" fill="#d4a017" />
      <rect x="6" y="10" width="20" height="5" rx="1" fill="#f0c040" />
      <rect x="8" y="6" width="16" height="5" rx="1" fill="#ffd54f" />
    </svg>
  );
}

function BtcIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[#f7931a] font-bold text-white",
        className,
      )}
    >
      ₿
    </span>
  );
}

function EthIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[#627eea] font-bold text-white",
        className,
      )}
    >
      ◆
    </span>
  );
}

function ForexFlags({ base, quote, size }: { base: string; quote?: string; size: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const flag = size === "sm" ? "h-[18px] w-[18px] text-[7px]" : "h-5 w-5 text-[8px]";

  const baseColors: Record<string, string> = {
    US: "bg-blue-700",
    EU: "bg-blue-800",
    GB: "bg-red-700",
    JP: "bg-red-600",
    AU: "bg-blue-600",
    CH: "bg-red-600",
    IN: "bg-orange-600",
  };
  const quoteColors: Record<string, string> = {
    US: "bg-green-700",
    JP: "bg-white text-red-600",
    IN: "bg-green-700",
  };

  const bKey = base.slice(0, 2);
  const qKey = quote?.slice(0, 2) ?? "US";

  return (
    <span className={cn("relative shrink-0", dim)}>
      <span
        className={cn(
          "absolute left-0 top-0 grid place-items-center rounded-full font-bold text-white ring-1 ring-[#0c1017]",
          flag,
          baseColors[bKey] ?? "bg-blue-700",
        )}
      >
        {bKey}
      </span>
      <span
        className={cn(
          "absolute bottom-0 right-0 grid place-items-center rounded-full font-bold ring-1 ring-[#0c1017]",
          flag,
          quoteColors[qKey] ?? "bg-green-700 text-white",
        )}
      >
        {qKey}
      </span>
    </span>
  );
}

export function AssetIcon({ asset, size = "md" }: { asset: Asset; size?: "sm" | "md" }) {
  const [base, quote] = asset.symbol.split("/");
  const dim = size === "sm" ? "h-7 w-7 text-[9px]" : "h-8 w-8 text-[10px]";

  if (asset.symbol === "XAU/USD") {
    return <GoldBarsIcon className={cn("shrink-0", size === "sm" ? "h-7 w-7" : "h-8 w-8")} />;
  }

  if (asset.symbol.startsWith("BTC")) {
    return <BtcIcon className={cn(dim, "rounded-full")} />;
  }

  if (asset.symbol.startsWith("ETH")) {
    return <EthIcon className={cn(dim, "rounded-full text-[11px]")} />;
  }

  if (asset.category === "forex") {
    return <ForexFlags base={base} quote={quote} size={size} />;
  }

  if (asset.category === "indices") {
    const colors: Record<string, string> = {
      NAS100: "bg-blue-600",
      US30: "bg-blue-800",
      DAX40: "bg-yellow-600 text-black",
      NIFTY50: "bg-orange-600",
      US500: "bg-indigo-700",
    };
    const label = asset.symbol.slice(0, 3);
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full font-bold text-white",
          dim,
          colors[asset.symbol] ?? "bg-purple-700",
        )}
      >
        {label}
      </span>
    );
  }

  if (asset.category === "metals") {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 font-bold text-slate-900",
          dim,
        )}
      >
        Ag
      </span>
    );
  }

  if (asset.category === "crypto") {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-orange-500 font-bold text-white",
          dim,
        )}
      >
        {base.slice(0, 1)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-emerald-700 font-bold text-white",
        dim,
      )}
    >
      {base.slice(0, 2)}
    </span>
  );
}

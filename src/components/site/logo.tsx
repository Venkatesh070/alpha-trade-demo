import { cn } from "@/lib/utils";

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display font-extrabold tracking-tight",
        className,
      )}
    >
      <span className="relative inline-grid h-8 w-8 place-items-center rounded-lg glossy">
        <span
          className="absolute inset-0 rounded-lg"
          style={{
            background:
              "linear-gradient(135deg, var(--gold-soft), var(--gold) 50%, var(--gold-deep))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.2)",
          }}
        />
        <span className="relative text-[color:var(--primary-foreground)] text-sm font-black">
          E
        </span>
      </span>
      {!mark && (
        <span className="leading-none">
          <span className="gold-text">EXNESS</span>
          <span className="ml-1 text-foreground/90">INDIA</span>
        </span>
      )}
    </span>
  );
}

import { cn } from "@/lib/utils";

const MARK = "/logo.png";
const TEXT = "/logo-text.png";

const SIZES = {
  sm: { mark: "h-7 w-7", textBox: "h-3.5", textImg: "h-6" },
  md: { mark: "h-8 w-8", textBox: "h-4", textImg: "h-7" },
  lg: { mark: "h-10 w-10", textBox: "h-5", textImg: "h-9" },
} as const;

function LogoText({
  textBox,
  textImg,
  className,
}: {
  textBox: string;
  textImg: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center overflow-hidden", textBox, className)}>
      <img
        src={TEXT}
        alt="exness"
        className={cn(textImg, "block w-auto max-w-none object-contain mix-blend-multiply dark:hidden")}
      />
      <img
        src={TEXT}
        alt="exness"
        className={cn(
          textImg,
          "hidden w-auto max-w-none object-contain dark:block dark:invert dark:mix-blend-screen",
        )}
      />
    </span>
  );
}

export function Logo({
  className,
  mark = false,
  size = "md",
  showRegion = true,
}: {
  className?: string;
  mark?: boolean;
  size?: keyof typeof SIZES;
  showRegion?: boolean;
}) {
  const s = SIZES[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={MARK}
        alt=""
        aria-hidden
        className={cn(s.mark, "block shrink-0 rounded-full object-cover")}
      />
      {!mark && (
        <span className="inline-flex items-center gap-1.5">
          <LogoText textBox={s.textBox} textImg={s.textImg} />
          {showRegion && (
            <span className="text-[11px] font-semibold leading-none tracking-wide text-muted-foreground">
              India
            </span>
          )}
        </span>
      )}
    </span>
  );
}

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "support@exness.com";

export function AuthGate({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-white text-[#141d22]", className)}>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="flex w-full max-w-md flex-col items-center gap-7">
          <Link to="/" className="shrink-0">
            <img src="/logo-text.png" alt="exness" className="h-9 w-auto mix-blend-multiply" />
          </Link>

          <p className="max-w-sm text-sm leading-relaxed text-[#141d22]/60">
            Please sign in or register for full access to Exness content and services.
          </p>

          <div className="flex w-full max-w-[216px] flex-col gap-4">
            <Link
              to="/login"
              search={{ step: "form" }}
              className={cn(
                "inline-flex min-h-12 w-full items-center justify-center rounded px-6",
                "bg-[#ffde02] text-base font-semibold text-black",
                "transition-colors hover:bg-[#ffe535] active:bg-[#d1b500]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#158bf9]",
              )}
            >
              Sign in
            </Link>
            <Link
              to="/register"
              search={{ step: "form" }}
              className={cn(
                "inline-flex min-h-12 w-full items-center justify-center rounded px-6",
                "bg-[#6c8595]/[0.08] text-base font-semibold text-[#141d22]",
                "transition-colors hover:bg-[#6c8595]/[0.12] active:bg-[#6c8595]/20",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#158bf9]",
              )}
            >
              Register
            </Link>
          </div>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-xs text-[#141d22] underline decoration-[#141d22]/40 underline-offset-2 hover:decoration-[#141d22]"
          >
            {SUPPORT_EMAIL}
          </a>
        </div>
      </main>

      <footer className="px-6 pb-10 pt-4">
        <div className="mx-auto max-w-2xl border-t border-[#141d22]/12 pt-6">
          <p className="text-center text-xs leading-relaxed text-[#141d22]/60">
            Vanvest Limited is registered and regulated by the Financial Services Commission of
            the Republic of Vanuatu under registration number 700276.
          </p>
        </div>
      </footer>
    </div>
  );
}

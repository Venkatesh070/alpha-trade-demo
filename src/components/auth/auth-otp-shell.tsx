import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/site/logo";

const SUPPORT_EMAIL = "support@exness.com";

export function AuthOtpShell({
  children,
  backTo,
}: {
  children: ReactNode;
  backTo?: { to: string; search?: Record<string, unknown> };
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9] text-[#141d22]">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-[440px] rounded-2xl bg-white px-6 py-8 shadow-[0_12px_16px_-4px_rgba(16,24,40,0.08),0_4px_6px_-2px_rgba(16,24,40,0.03)] sm:px-8 sm:py-10">
          {backTo && (
            <Link
              to={backTo.to}
              search={backTo.search}
              className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#141d22]/70 transition-colors hover:bg-[#f1f5f9] hover:text-[#141d22] sm:left-6 sm:top-6"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}

          <div className="mb-8 flex justify-center pt-2">
            <Logo showRegion={false} />
          </div>

          {children}
        </div>
      </main>

      <footer className="px-4 pb-8 text-center">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-xs text-[#141d22]/50 hover:text-[#141d22]/70 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </footer>
    </div>
  );
}

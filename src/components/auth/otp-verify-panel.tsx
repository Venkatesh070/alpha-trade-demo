import { useEffect, useRef, useState, type ReactNode } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "support@exness.com";

interface OtpVerifyPanelProps {
  email: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  verifying?: boolean;
  resendInSeconds?: number;
  trustDevice?: boolean;
  onTrustDeviceChange?: (value: boolean) => void;
  showTrustDevice?: boolean;
  description?: ReactNode;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export function OtpVerifyPanel({
  email,
  title = "Enter code",
  subtitle = "Authentication required",
  loading = false,
  verifying = false,
  resendInSeconds = 0,
  trustDevice = false,
  onTrustDeviceChange,
  showTrustDevice = true,
  description,
  onVerify,
  onResend,
}: OtpVerifyPanelProps) {
  const [code, setCode] = useState("");
  const submittedRef = useRef("");

  const canSubmit = code.length === 6 && !verifying && !loading;

  useEffect(() => {
    if (code.length !== 6 || submittedRef.current === code) return;
    submittedRef.current = code;
    onVerify(code);
  }, [code, onVerify]);

  return (
    <div className="space-y-7">
      <div className="text-center">
        <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-[#141d22]">
          {title}
        </h1>
        <p className="mt-3 text-sm font-medium text-[#141d22]/80">{subtitle}</p>
        <p className="mx-auto mt-3 max-w-[320px] text-sm leading-relaxed text-[#64748b]">
          {description ?? (
            <>
              Enter the 6-digit code sent to your verified email{" "}
              <span className="font-medium text-[#141d22]">{email}</span>.
            </>
          )}
        </p>
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          disabled={loading || verifying}
          containerClassName="gap-2.5 sm:gap-3"
        >
          <InputOTPGroup className="gap-2.5 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  "h-[52px] w-[44px] rounded-lg border border-[#e2e8f0] bg-white",
                  "text-xl font-semibold text-[#141d22] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]",
                  "first:rounded-lg last:rounded-lg",
                  "data-[active=true]:border-[#141d22] data-[active=true]:ring-2 data-[active=true]:ring-[#141d22]/10",
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {showTrustDevice && onTrustDeviceChange && (
        <label className="flex cursor-pointer items-start gap-3 text-left">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => onTrustDeviceChange(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-[#cbd5e1] accent-[#141d22]"
          />
          <span className="text-sm leading-relaxed text-[#64748b]">
            <span className="font-medium text-[#141d22]">I trust this device</span>
            <br />
            Trusting this device means you won&apos;t need to enter a verification code for 30 days,
            and you&apos;ll be able to trust, disconnect, or log out other devices.
          </span>
        </label>
      )}

      <div className="space-y-3 text-center text-sm">
        <p className="text-[#64748b]">
          Unable to continue?{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-[#1570ef] hover:underline">
            Get help
          </a>
        </p>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            disabled={resendInSeconds > 0 || loading}
            onClick={onResend}
            className="font-medium text-[#1570ef] hover:underline disabled:cursor-not-allowed disabled:text-[#94a3b8] disabled:no-underline"
          >
            Didn&apos;t receive email?
          </button>
          {resendInSeconds > 0 && (
            <p className="text-xs text-[#94a3b8]">Resend code in: {resendInSeconds}s</p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onVerify(code)}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors",
          canSubmit
            ? "bg-[#141d22] text-white hover:bg-[#1e293b]"
            : "cursor-not-allowed bg-[#e2e8f0] text-[#94a3b8]",
        )}
      >
        {verifying ? "Verifying…" : "Verify code"}
      </button>
    </div>
  );
}

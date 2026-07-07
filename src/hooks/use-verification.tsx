import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { pushNotification } from "@/lib/notifications-db";
import {
  emptyKycState,
  getKycOverallStatus,
  getKycState,
  isKycApproved,
  isKycFullySubmitted,
  kycApprovedCount,
  kycProgressPercent,
  KYC_STEPS,
  submitKycStep,
  VERIFICATION_STORAGE_KEY,
  type KycOverallStatus,
  type KycState,
  type KycStepId,
} from "@/lib/verification-db";

interface VerificationCtx {
  state: KycState;
  steps: typeof KYC_STEPS;
  approvedCount: number;
  progress: number;
  fullySubmitted: boolean;
  isApproved: boolean;
  overallStatus: KycOverallStatus;
  submitStep: (stepId: KycStepId, file: File) => Promise<void>;
  refresh: () => void;
}

const VerificationContext = createContext<VerificationCtx | null>(null);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<KycState>(emptyKycState);

  const refresh = useCallback(() => {
    if (!user?.email) {
      setState(emptyKycState());
      return;
    }
    setState(getKycState(user.email));
  }, [user?.email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key !== VERIFICATION_STORAGE_KEY) return;
      refresh();
    };
    window.addEventListener("exness-kyc-updated", onUpdate);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("exness-kyc-updated", onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const submitStep = useCallback(
    async (stepId: KycStepId, file: File) => {
      if (!user?.email) return;
      const prev = getKycState(user.email);
      const step = prev.steps[stepId];
      if (step.status === "submitted" || step.status === "approved") return;

      const next = await submitKycStep(user.email, stepId, file, {
        userName: user.name,
        userId: user.id,
      });
      setState(next);

      const meta = KYC_STEPS.find((s) => s.id === stepId);
      pushNotification(user.email, {
        type: "verification",
        title: "Document uploaded",
        body: `${meta?.title ?? "KYC document"} submitted for review.`,
      });

      if (isKycFullySubmitted(next) && !isKycFullySubmitted(prev)) {
        pushNotification(user.email, {
          type: "verification",
          title: "KYC submitted",
          body: "All documents received. Our team will review them shortly.",
        });
      }
    },
    [user],
  );

  const overallStatus = getKycOverallStatus(state);

  const value = useMemo<VerificationCtx>(
    () => ({
      state,
      steps: KYC_STEPS,
      approvedCount: kycApprovedCount(state),
      progress: kycProgressPercent(state),
      fullySubmitted: isKycFullySubmitted(state),
      isApproved: isKycApproved(state),
      overallStatus,
      submitStep,
      refresh,
    }),
    [state, overallStatus, submitStep, refresh],
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within VerificationProvider");
  return ctx;
}

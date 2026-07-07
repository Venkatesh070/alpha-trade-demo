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
  getKycState,
  isKycFullySubmitted,
  kycCompletedCount,
  kycProgressPercent,
  KYC_STEPS,
  submitKycStep,
  VERIFICATION_STORAGE_KEY,
  type KycState,
  type KycStepId,
} from "@/lib/verification-db";

interface VerificationCtx {
  state: KycState;
  steps: typeof KYC_STEPS;
  completedCount: number;
  progress: number;
  fullySubmitted: boolean;
  submitStep: (stepId: KycStepId) => void;
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
    (stepId: KycStepId) => {
      if (!user?.email) return;
      const prev = getKycState(user.email);
      if (prev.steps[stepId] !== "pending") return;

      const next = submitKycStep(user.email, stepId);
      setState(next);

      const step = KYC_STEPS.find((s) => s.id === stepId);
      pushNotification(user.email, {
        type: "verification",
        title: "Document uploaded",
        body: `${step?.title ?? "KYC document"} submitted for review.`,
      });

      if (isKycFullySubmitted(next) && !isKycFullySubmitted(prev)) {
        pushNotification(user.email, {
          type: "verification",
          title: "KYC submitted",
          body: "All documents received. Review typically completes within 1 hour.",
        });
      }
    },
    [user?.email],
  );

  const value = useMemo<VerificationCtx>(
    () => ({
      state,
      steps: KYC_STEPS,
      completedCount: kycCompletedCount(state),
      progress: kycProgressPercent(state),
      fullySubmitted: isKycFullySubmitted(state),
      submitStep,
      refresh,
    }),
    [state, submitStep, refresh],
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within VerificationProvider");
  return ctx;
}

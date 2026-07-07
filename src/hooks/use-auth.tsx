import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { type UserProfile, userMe, userRegister, userVerifyEmail, adminMe } from "@/lib/auth-api";
import { mailSendLoginOtp, mailSendPasswordReset, mailSendWelcome, mailVerifyLoginOtp } from "@/lib/mail-api";
import { sendUserVerificationEmail } from "@/lib/email-verification";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";
import { auth } from "@/lib/firebase";
import { clearReferralCode, markReferralVerified, recordReferralSignup } from "@/lib/referral-db";
import { getProfileExtras } from "@/lib/profile-db";
import {
  clearLegacyBrowserSessionKeys,
  completeOtpSession,
  fetchUserSessionStatus,
  logoutUserSession,
  type UserSessionStatus,
} from "@/lib/session-api";

interface AuthCtx {
  user: UserProfile | null;
  emailVerified: boolean;
  isAuthenticated: boolean;
  needsEmailVerification: boolean;
  needsLoginOtp: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, refCode?: string) => Promise<void>;
  logout: () => void;
  resendVerificationEmail: () => Promise<void>;
  confirmEmailVerified: () => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  sendLoginOtp: () => Promise<number>;
  verifyLoginOtp: (code: string, trustThisDevice?: boolean) => Promise<void>;
  refreshSessionStatus: () => Promise<UserSessionStatus | null>;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

async function loadProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const idToken = await firebaseUser.getIdToken();
  const { user } = await userMe(idToken);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otpSessionReady, setOtpSessionReady] = useState(false);

  const refreshSessionStatus = useCallback(async (): Promise<UserSessionStatus | null> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser?.email || !firebaseUser.emailVerified) {
      setOtpSessionReady(false);
      return null;
    }

    try {
      const idToken = await firebaseUser.getIdToken();
      const status = await fetchUserSessionStatus(idToken);
      setOtpSessionReady(!status.otpRequired);
      return status;
    } catch (err) {
      console.error("Failed to load SQL session status:", err);
      setOtpSessionReady(false);
      return null;
    }
  }, []);

  useEffect(() => {
    clearLegacyBrowserSessionKeys();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        setOtpSessionReady(false);
        setLoading(false);
        return;
      }

      setEmailVerified(firebaseUser.emailVerified);

      try {
        const idToken = await firebaseUser.getIdToken();
        const adminCheck = await adminMe(idToken).catch(() => null);
        if (adminCheck?.admin) {
          setUser(null);
          setEmailVerified(false);
          setOtpSessionReady(false);
          setLoading(false);
          return;
        }

        const profile = await loadProfile(firebaseUser);
        const extras = getProfileExtras(profile.email);
        setUser({
          ...profile,
          country: extras.country ?? profile.country,
          twoFA: extras.twoFA ?? profile.twoFA,
        });
        if (firebaseUser.emailVerified && !profile.verified) {
          const freshToken = await firebaseUser.getIdToken(true);
          const { user: verifiedProfile } = await userVerifyEmail(freshToken);
          setUser(verifiedProfile);
        }

        if (firebaseUser.emailVerified) {
          await refreshSessionStatus();
        } else {
          setOtpSessionReady(false);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [refreshSessionStatus]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await cred.user.reload();
      setEmailVerified(cred.user.emailVerified);
      return cred.user.emailVerified;
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, refCode?: string) => {
    try {
      const { user: profile } = await userRegister({ name, email, password });
      setUser(profile);
      setEmailVerified(false);
      setOtpSessionReady(false);

      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendUserVerificationEmail(cred.user);

      if (refCode) {
        recordReferralSignup(refCode, { name, email });
        clearReferralCode();
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("already exists")) {
        throw err;
      }
      throw new Error(err instanceof Error ? err.message : mapFirebaseAuthError(err));
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error("Sign in again to resend the verification email.");
    }

    await sendUserVerificationEmail(firebaseUser);
  }, []);

  const confirmEmailVerified = useCallback(async (): Promise<boolean> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error("Sign in again to verify your email.");
    }

    await firebaseUser.reload();
    if (!firebaseUser.emailVerified) {
      setEmailVerified(false);
      return false;
    }

    setEmailVerified(true);
    const idToken = await firebaseUser.getIdToken(true);
    const { user: profile } = await userVerifyEmail(idToken);
    setUser(profile);
    if (firebaseUser.email) {
      markReferralVerified(firebaseUser.email);
    }
    await mailSendWelcome(idToken, profile.name).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    await refreshSessionStatus();
    return true;
  }, [refreshSessionStatus]);

  const logout = useCallback(() => {
    void (async () => {
      const idToken = await getAuthIdToken();
      try {
        await logoutUserSession(idToken ?? undefined);
      } catch {
        // still sign out locally
      }
      signOut(auth);
      setUser(null);
      setEmailVerified(false);
      setOtpSessionReady(false);
    })();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await mailSendPasswordReset(email);
  }, []);

  const sendLoginOtp = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new Error("Sign in again to receive a verification code.");
    }
    const idToken = await firebaseUser.getIdToken();
    const { resendInSeconds } = await mailSendLoginOtp(idToken);
    return resendInSeconds;
  }, []);

  const verifyLoginOtp = useCallback(
    async (code: string, trustThisDevice = false) => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser?.email) {
        throw new Error("Sign in again to verify your code.");
      }

      const idToken = await firebaseUser.getIdToken();
      await mailVerifyLoginOtp(idToken, code);
      const status = await completeOtpSession(idToken, trustThisDevice);
      setOtpSessionReady(!status.otpRequired);
    },
    [],
  );

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const needsLoginOtp = !!user && emailVerified && !otpSessionReady;
  const isAuthenticated = !!user && emailVerified && otpSessionReady;
  const needsEmailVerification = !!user && !emailVerified;

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      emailVerified,
      isAuthenticated,
      needsEmailVerification,
      needsLoginOtp,
      loading,
      login,
      register,
      logout,
      resendVerificationEmail,
      confirmEmailVerified,
      requestPasswordReset,
      sendLoginOtp,
      verifyLoginOtp,
      refreshSessionStatus,
      updateUser,
    }),
    [
      user,
      emailVerified,
      isAuthenticated,
      needsEmailVerification,
      needsLoginOtp,
      loading,
      login,
      register,
      logout,
      resendVerificationEmail,
      confirmEmailVerified,
      requestPasswordReset,
      sendLoginOtp,
      verifyLoginOtp,
      refreshSessionStatus,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export async function getAuthIdToken(): Promise<string | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;
  return firebaseUser.getIdToken();
}

export function clearLoginSessions() {
  clearLegacyBrowserSessionKeys();
}

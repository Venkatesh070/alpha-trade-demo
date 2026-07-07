import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut, type User as FirebaseUser } from "firebase/auth";
import {
  AuthApiError,
  adminMe,
  type UserProfile,
  userMe,
  userMeJwt,
  userRegister,
  userResendLoginOtp,
  userResendRegisterOtp,
  userStartLogin,
  userVerifyLoginOtp,
  userVerifyRegisterOtp,
} from "@/lib/auth-api";
import { logoutApiSession } from "@/lib/api-client";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import { signInWithGooglePopup } from "@/lib/google-auth";
import { sendUserPasswordResetEmail } from "@/lib/email-verification";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";
import { auth, getClientAuth } from "@/lib/firebase";
import { clearReferralCode, markReferralVerified, recordReferralSignup } from "@/lib/referral-db";
import { getProfileExtras } from "@/lib/profile-db";
import { clearTokens, getStoredTokens } from "@/lib/token-store";
import { clearLegacyBrowserSessionKeys } from "@/lib/admin-session-storage";

export type GoogleSignInOutcome =
  | { type: "admin" }
  | { type: "done" };

interface AuthCtx {
  user: UserProfile | null;
  emailVerified: boolean;
  isAuthenticated: boolean;
  needsEmailVerification: boolean;
  needsLoginOtp: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ resendInSeconds: number }>;
  signInWithGoogle: (refCode?: string) => Promise<GoogleSignInOutcome>;
  register: (name: string, email: string, password: string, refCode?: string) => Promise<void>;
  logout: () => void;
  resendVerificationEmail: (email: string) => Promise<void>;
  sendRegistrationOtp: (email: string) => Promise<number>;
  verifyRegistrationOtp: (email: string, code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  sendLoginOtp: (email: string) => Promise<number>;
  verifyLoginOtp: (email: string, code: string, trustThisDevice?: boolean) => Promise<void>;
  updateUser: (patch: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

const PENDING_REF_KEY = "pendingRegisterRef";

function applyProfileExtras(profile: UserProfile): UserProfile {
  const extras = getProfileExtras(profile.email);
  return {
    ...profile,
    country: extras.country ?? profile.country,
    twoFA: extras.twoFA ?? profile.twoFA,
  };
}

async function establishFirebaseSession(customToken: string): Promise<FirebaseUser> {
  const cred = await signInWithCustomToken(auth, customToken);
  await cred.user.reload();
  return cred.user;
}

function isGoogleAccount(firebaseUser: FirebaseUser): boolean {
  return firebaseUser.providerData.some((provider) => provider.providerId === "google.com");
}

async function loadProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  if (getStoredTokens()) {
    const { user } = await userMeJwt();
    return user;
  }
  const idToken = await firebaseUser.getIdToken();
  const { user } = await userMe(idToken);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otpSessionReady, setOtpSessionReady] = useState(false);

  const completeBackendAuth = useCallback(
    async (data: { user: UserProfile; customToken: string }) => {
      await establishFirebaseSession(data.customToken);
      const profile = applyProfileExtras(data.user);
      setUser(profile);
      setEmailVerified(true);
      setOtpSessionReady(true);
      return profile;
    },
    [],
  );

  useEffect(() => {
    clearLegacyBrowserSessionKeys();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreJwtSession(): Promise<boolean> {
      if (!getStoredTokens()) return false;
      try {
        const { user: profile } = await userMeJwt();
        if (cancelled) return true;
        setUser(applyProfileExtras(profile));
        setEmailVerified(true);
        setOtpSessionReady(true);
        return true;
      } catch {
        clearTokens();
        return false;
      }
    }

    const unsubscribe = onAuthStateChanged(getClientAuth(), async (firebaseUser) => {
      if (cancelled) return;

      if (!firebaseUser) {
        const restored = await restoreJwtSession();
        if (!restored) {
          setUser(null);
          setEmailVerified(false);
          setOtpSessionReady(false);
        }
        setLoading(false);
        return;
      }

      setEmailVerified(firebaseUser.emailVerified);

      try {
        const idToken = await firebaseUser.getIdToken();
        const adminCheck = await Promise.race([
          adminMe(idToken).catch(() => null),
          new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 5000)),
        ]);
        if (adminCheck?.admin) {
          setUser(null);
          setEmailVerified(false);
          setOtpSessionReady(false);
          setLoading(false);
          return;
        }

        let profile: UserProfile;
        try {
          profile = await loadProfile(firebaseUser);
        } catch (err) {
          if (!isGoogleAccount(firebaseUser)) {
            throw err;
          }
          profile = (await ensureUserProfile(firebaseUser)).user;
        }

        setUser(applyProfileExtras(profile));
        setOtpSessionReady(firebaseUser.emailVerified && (profile.verified || getStoredTokens() !== null));
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setUser(null);
        setOtpSessionReady(false);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await userStartLogin(email, password);
      return { resendInSeconds: result.resendInSeconds };
    } catch (err) {
      const message =
        err instanceof AuthApiError ? err.message : err instanceof Error ? err.message : "Sign in failed.";
      throw new Error(message);
    }
  }, []);

  const signInWithGoogle = useCallback(async (refCode?: string): Promise<GoogleSignInOutcome> => {
    try {
      const cred = await signInWithGooglePopup();
      await cred.user.reload();

      const idToken = await cred.user.getIdToken();
      const adminCheck = await adminMe(idToken).catch(() => null);
      if (adminCheck?.admin) {
        await signOut(auth);
        return { type: "admin" };
      }

      const { user: profile, isNewUser } = await ensureUserProfile(cred.user);
      setUser(applyProfileExtras(profile));
      setEmailVerified(cred.user.emailVerified);
      setOtpSessionReady(true);

      if (isNewUser) {
        if (refCode && cred.user.email) {
          recordReferralSignup(refCode, { name: profile.name, email: cred.user.email });
          clearReferralCode();
        }
        if (cred.user.emailVerified && cred.user.email) {
          markReferralVerified(cred.user.email);
        }
      }

      return { type: "done" };
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err));
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, refCode?: string) => {
    try {
      await userRegister({ name, email, password });
      if (refCode) {
        sessionStorage.setItem(PENDING_REF_KEY, refCode);
      } else {
        sessionStorage.removeItem(PENDING_REF_KEY);
      }
    } catch (err) {
      const message =
        err instanceof AuthApiError ? err.message : err instanceof Error ? err.message : "Registration failed.";
      throw new Error(message);
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    await userResendRegisterOtp(email);
  }, []);

  const sendRegistrationOtp = useCallback(async (email: string) => {
    const { resendInSeconds } = await userResendRegisterOtp(email);
    return resendInSeconds;
  }, []);

  const verifyRegistrationOtp = useCallback(
    async (email: string, code: string) => {
      const data = await userVerifyRegisterOtp(email, code);
      const profile = await completeBackendAuth(data);

      const refCode = sessionStorage.getItem(PENDING_REF_KEY);
      if (refCode) {
        recordReferralSignup(refCode, { name: profile.name, email });
        clearReferralCode();
        sessionStorage.removeItem(PENDING_REF_KEY);
      }
      markReferralVerified(email);
    },
    [completeBackendAuth],
  );

  const logout = useCallback(() => {
    void (async () => {
      try {
        await logoutApiSession();
      } catch {
        clearTokens();
      }
      await signOut(auth);
      setUser(null);
      setEmailVerified(false);
      setOtpSessionReady(false);
    })();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await sendUserPasswordResetEmail(email);
  }, []);

  const sendLoginOtp = useCallback(async (email: string) => {
    const { resendInSeconds } = await userResendLoginOtp(email);
    return resendInSeconds;
  }, []);

  const verifyLoginOtp = useCallback(
    async (email: string, code: string, _trustThisDevice = false) => {
      const data = await userVerifyLoginOtp(email, code);
      await completeBackendAuth(data);
    },
    [completeBackendAuth],
  );

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const needsLoginOtp = false;
  const isAuthenticated = !!user && emailVerified && otpSessionReady;
  const needsEmailVerification = false;

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      emailVerified,
      isAuthenticated,
      needsEmailVerification,
      needsLoginOtp,
      loading,
      login,
      signInWithGoogle,
      register,
      logout,
      resendVerificationEmail,
      sendRegistrationOtp,
      verifyRegistrationOtp,
      requestPasswordReset,
      sendLoginOtp,
      verifyLoginOtp,
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
      signInWithGoogle,
      register,
      logout,
      resendVerificationEmail,
      sendRegistrationOtp,
      verifyRegistrationOtp,
      requestPasswordReset,
      sendLoginOtp,
      verifyLoginOtp,
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
  clearTokens();
}

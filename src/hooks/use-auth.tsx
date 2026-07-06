import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { type UserProfile, userMe, userRegister, userVerifyEmail, adminMe } from "@/lib/auth-api";
import { sendUserVerificationEmail } from "@/lib/email-verification";
import { mapFirebaseAuthError } from "@/lib/firebase-errors";
import { auth } from "@/lib/firebase";

export type DemoUser = UserProfile;

interface AuthCtx {
  user: DemoUser | null;
  emailVerified: boolean;
  isAuthenticated: boolean;
  needsEmailVerification: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  resendVerificationEmail: () => Promise<void>;
  confirmEmailVerified: () => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  updateUser: (patch: Partial<DemoUser>) => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

async function loadProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const idToken = await firebaseUser.getIdToken();
  const { user } = await userMe(idToken);
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
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
          setLoading(false);
          return;
        }

        const profile = await loadProfile(firebaseUser);
        setUser(profile);
        if (firebaseUser.emailVerified && !profile.verified) {
          const freshToken = await firebaseUser.getIdToken(true);
          const { user: verifiedProfile } = await userVerifyEmail(freshToken);
          setUser(verifiedProfile);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

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

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { user: profile } = await userRegister({ name, email, password });
      setUser(profile);
      setEmailVerified(false);

      const cred = await signInWithEmailAndPassword(auth, email, password);
      await sendUserVerificationEmail(cred.user);
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
    return true;
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
    setEmailVerified(false);
  }, []);

  const resetPassword = useCallback(async (email: string, _newPassword: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const updateUser = useCallback((patch: Partial<DemoUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const isAuthenticated = !!user && emailVerified;
  const needsEmailVerification = !!user && !emailVerified;

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      emailVerified,
      isAuthenticated,
      needsEmailVerification,
      loading,
      login,
      register,
      logout,
      resendVerificationEmail,
      confirmEmailVerified,
      resetPassword,
      updateUser,
    }),
    [
      user,
      emailVerified,
      isAuthenticated,
      needsEmailVerification,
      loading,
      login,
      register,
      logout,
      resendVerificationEmail,
      confirmEmailVerified,
      resetPassword,
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

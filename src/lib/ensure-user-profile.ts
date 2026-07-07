import type { User as FirebaseUser } from "firebase/auth";
import { AuthApiError, type UserProfile, userMeWithIdToken, userSyncWithIdToken, userVerifyEmail } from "@/lib/auth-api";

export async function ensureUserProfile(
  firebaseUser: FirebaseUser,
): Promise<{ user: UserProfile; isNewUser: boolean }> {
  const idToken = await firebaseUser.getIdToken();

  try {
    const { user } = await userMeWithIdToken(idToken);
    return { user, isNewUser: false };
  } catch (err) {
    const missingProfile =
      err instanceof AuthApiError && (err.status === 404 || err.status === 401);
    if (!missingProfile) throw err;
  }

  const name =
    firebaseUser.displayName?.trim() ||
    firebaseUser.email?.split("@")[0] ||
    "User";

  const { user } = await userSyncWithIdToken(idToken, { name });

  if (firebaseUser.emailVerified) {
    try {
      const { user: verified } = await userVerifyEmail(idToken);
      return { user: verified, isNewUser: true };
    } catch {
      return { user, isNewUser: true };
    }
  }

  return { user, isNewUser: true };
}

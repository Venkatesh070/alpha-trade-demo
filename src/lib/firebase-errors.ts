const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
    "Firebase API key is invalid. Copy the real key from Firebase Console → Project settings → Your apps → Web app config → apiKey, then update .env and restart the dev server.",
  "auth/api-key-not-valid":
    "Firebase API key is invalid. Update VITE_FIREBASE_API_KEY in .env from Firebase Console.",
  "auth/invalid-api-key":
    "Firebase API key is invalid. Update VITE_FIREBASE_API_KEY in .env from Firebase Console.",
  "auth/email-already-in-use": "An account with that email already exists.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "No account found for that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/operation-not-allowed":
    "Email/password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method → Email/Password.",
  "auth/configuration-not-found":
    "Firebase Authentication is not set up. Open Firebase Console → Authentication → Get started, then enable Email/Password sign-in.",
  "auth/unauthorized-domain":
    "This site is not authorized in Firebase. Add localhost to Authentication → Settings → Authorized domains in Firebase Console.",
  "auth/invalid-continue-uri":
    "Verification link misconfigured. Ensure localhost is in Firebase Authorized domains.",
  "auth/expired-action-code": "This link has expired. Request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used.",
};

const REST_ERROR_MESSAGES: Record<string, string> = {
  CONFIGURATION_NOT_FOUND:
    "Firebase Authentication is not set up for this project. Open Firebase Console → Authentication → Get started, then enable Email/Password under Sign-in method.",
};

export function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code?.toLowerCase();
  if (code && FIREBASE_AUTH_ERRORS[code]) {
    return FIREBASE_AUTH_ERRORS[code];
  }

  const message = (err as Error)?.message ?? "";
  const upper = message.toUpperCase();
  if (REST_ERROR_MESSAGES[upper]) {
    return REST_ERROR_MESSAGES[upper];
  }
  if (upper.includes("CONFIGURATION_NOT_FOUND")) {
    return REST_ERROR_MESSAGES.CONFIGURATION_NOT_FOUND!;
  }

  if (message) return message;

  return "Authentication failed. Please try again.";
}

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function getServiceAccount(): {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    const parsed = JSON.parse(json) as {
      project_id?: string;
      projectId?: string;
      client_email?: string;
      clientEmail?: string;
      private_key?: string;
      privateKey?: string;
    };
    return {
      projectId: parsed.project_id ?? parsed.projectId ?? "",
      clientEmail: parsed.client_email ?? parsed.clientEmail ?? "",
      privateKey: (parsed.private_key ?? parsed.privateKey ?? "").replace(/\\n/g, "\n"),
    };
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  };
}

let adminApp: App | undefined;
let adminAuth: Auth | undefined;

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const account = getServiceAccount();
    if (!account.projectId || !account.clientEmail || !account.privateKey) {
      throw new Error(
        "Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
      );
    }

    adminApp = getApps()[0] ?? initializeApp({ credential: cert(account) });
    adminAuth = getAuth(adminApp);
  }

  return adminAuth;
}

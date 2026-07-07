import { GoogleAuthProvider, signInWithPopup, type UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGooglePopup(): Promise<UserCredential> {
  return signInWithPopup(auth, provider);
}

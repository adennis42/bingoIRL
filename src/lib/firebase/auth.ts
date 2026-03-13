import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInAnonymously,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";

export async function signIn(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signUp(
  email: string,
  password: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function signInAnonymouslyUser(): Promise<User> {
  const userCredential = await signInAnonymously(auth);
  return userCredential.user;
}

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function isHost(user: User | null): boolean {
  if (!user) return false;
  return user.providerData.some(
    (provider) => provider.providerId !== "anonymous"
  );
}

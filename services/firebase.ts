import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const app = (firebaseConfig.apiKey) ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

if (!app) {
  console.warn("Firebase credentials missing. Running in offline mode.");
}

// --- Helper Functions for Persistence ---
export const saveUserProfile = async (email: string, profile: any) => {
  if (!email || !db) return; // Return if no DB
  try {
    await setDoc(doc(db, "users", email), profile, { merge: true });
    console.log("Profile saved to Firestore");
  } catch (e) {
    console.error("Error saving profile:", e);
  }
};

export const getUserProfile = async (email: string): Promise<any | null> => {
  if (!email || !db) return null; // Return null if no DB
  try {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error("Error getting profile:", e);
  }
  return null;
};

export { auth, googleProvider, appleProvider, db };

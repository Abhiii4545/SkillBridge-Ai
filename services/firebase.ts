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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

// --- Helper Functions for Persistence ---
export const saveUserProfile = async (email: string, profile: any) => {
  if (!email) return;
  try {
    await setDoc(doc(db, "users", email), profile, { merge: true });
    console.log("Profile saved to Firestore");
  } catch (e) {
    console.error("Error saving profile:", e);
  }
};

export const getUserProfile = async (email: string): Promise<any | null> => {
  if (!email) return null;
  try {
    const docRef = doc(db, "users", email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error("Error fetching profile:", e);
  }
  return null;
};

export { app, auth, db, googleProvider, appleProvider };

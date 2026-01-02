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

import { getFirestore } from "firebase/firestore";

const app = (firebaseConfig.apiKey) ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

if (!app) {
  console.warn("Firebase credentials missing. Running in offline mode.");
}

// --- Helper Functions for Persistence ---
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

// --- Internship Persistence (Global Visibility) ---
// --- Internship Persistence (Global Visibility) ---
import { collection, addDoc, getDocs, query, orderBy, onSnapshot, where, updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export const addInternshipToFirestore = async (internship: any) => {
  if (!db) return;
  try {
    const docRef = await addDoc(collection(db, "internships"), {
      ...internship,
      createdAt: new Date().toISOString()
    });
    console.log("Internship published:", docRef.id);
  } catch (e) {
    console.error("Error publishing internship:", e);
    throw e;
  }
};

export const getInternshipsFromFirestore = async (): Promise<any[]> => {
  if (!db) return [];
  try {
    const q = query(collection(db, "internships"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    // Return data, using Firestore ID as the 'id'
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error fetching global internships:", e);
    return [];
  }
};

export const subscribeToInternships = (callback: (internships: any[]) => void) => {
  if (!db) return () => { };
  const q = query(collection(db, "internships"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(jobs);
  });
};

// --- Real-Time Notifications & Applications ---

// 1. Subscribe to Notifications (Live Bell Icon)
export const subscribeToNotifications = (email: string, callback: (notifs: any[]) => void) => {
  if (!db || !email) {
    console.warn("Skipping notification subscription: No DB or Email", { email });
    return () => { };
  }

  console.log("Subscribing to notifications for:", email);

  const q = query(
    collection(db, "notifications"),
    where("recipientEmail", "==", email),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifs);
  });
};

// 2. Send Notification (Recruiter Action -> Student Alert)
export const sendNotification = async (recipientEmail: string, message: string, type: 'status' | 'view' | 'job') => {
  if (!db) return;
  console.log("Sending notification to:", recipientEmail, "Message:", message);
  try {
    await addDoc(collection(db, "notifications"), {
      recipientEmail,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Error sending notification:", e);
  }
};

// 3. Mark as Read
export const markNotificationAsRead = async (id: string) => {
  if (!db) return;
  await updateDoc(doc(db, "notifications", id), { read: true });
};

// 4. Live Applications (Student "My Applications" tab)
// 4. Live Applications (Student "My Applications" tab)
export const subscribeToStudentApplications = (studentEmail: string, callback: (apps: any[]) => void) => {
  if (!db || !studentEmail) {
    console.warn("subscribeToStudentApplications skipped: Missing DB or Email", studentEmail);
    return () => { };
  }

  console.log("Subscribing to applications for:", studentEmail);
  const q = query(collection(db, "applications"), where("studentEmail", "==", studentEmail));

  return onSnapshot(q, (snapshot) => {
    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Applications received:", apps.length);
    callback(apps);
  }, (error) => {
    console.error("Error subscribing to applications:", error);
  });
};

// 5. Update Status & Notify (The "Unstop" Real-time Feature)
// 5. Update Status & Notify (The "Unstop" Real-time Feature)
export const updateApplicationStatusWithNotification = async (appId: string, newStatus: string, studentEmail: string, jobTitle: string) => {
  if (!db) return;

  // 1. Update Application Doc
  const appRef = doc(db, "applications", appId);
  await updateDoc(appRef, { status: newStatus });

  // 2. Send Notification
  await sendNotification(
    studentEmail,
    `Your application for ${jobTitle} is now: ${newStatus}`,
    'status'
  );
};

// 5b. Send Email via Firebase Extension
export const sendEmailViaFirebase = async (to: string, subject: string, html: string) => {
  if (!db) return;
  try {
    await addDoc(collection(db, "mail"), {
      to: [to],
      message: {
        subject: subject,
        html: html
      }
    });
    console.log("Email trigger written to 'mail' collection");
  } catch (e) {
    console.error("Error sending email trigger:", e);
  }
};

// 6. Submit Application (Student -> Firestore)
export const submitApplicationToFirestore = async (application: any) => {
  if (!db) return;
  await addDoc(collection(db, "applications"), application);
};

// 7. Subscribe to Job Applications (Recruiter View) - HYBRID ISOLATION (Email + Legacy Fallback)
export const subscribeToRecruiterApplications = (recruiterEmail: string, callback: (apps: any[]) => void, companyName?: string) => {
  if (!db) return () => { };

  let appsFromEmail: any[] = [];
  let appsFromCompany: any[] = [];

  const mergeAndCallback = () => {
    // Deduplicate by ID
    const all = [...appsFromEmail, ...appsFromCompany];
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
    console.log(`Merged count: ${unique.length}`);
    callback(unique);
  };

  // 1. Strict Isolation (New Apps)
  console.log(`Subscribing to Recruiter Apps (Email: ${recruiterEmail})`);
  const q1 = query(collection(db, "applications"), where("recruiterEmail", "==", recruiterEmail));
  const unsub1 = onSnapshot(q1, (snap) => {
    appsFromEmail = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`Subscription 1 (Email): ${appsFromEmail.length}`);
    mergeAndCallback();
  });

  // 2. Legacy Fallback (Old Apps with no owner)
  let unsub2 = () => { };
  if (companyName) {
    console.log(`Subscribing to Legacy Apps (Company: ${companyName})`);
    const q2 = query(collection(db, "applications"), where("companyName", "==", companyName));
    unsub2 = onSnapshot(q2, (snap) => {
      const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Only show apps that DON'T have a specific owner (Legacy) OR match me
      appsFromCompany = raw.filter((a: any) => !a.recruiterEmail || a.recruiterEmail === recruiterEmail);
      console.log(`Subscription 2 (Company): ${raw.length} raw, ${appsFromCompany.length} after filter`);
      mergeAndCallback();
    });
  } else {
    console.log("No Company Name provided for Legacy Fallback.");
  }

  return () => { unsub1(); unsub2(); };
};

export const deleteInternshipFromFirestore = async (internshipId: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "internships", internshipId));
    console.log("Internship deleted:", internshipId);
  } catch (e) {
    console.error("Error deleting internship:", e);
    throw e;
  }
};

export { auth, googleProvider, appleProvider, db };

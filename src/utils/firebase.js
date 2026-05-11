import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB4-JIw6WyjRwsqCWwWMXSfvzW1tV6eRks",
  authDomain: "ai-bord-f930c.firebaseapp.com",
  projectId: "ai-bord-f930c",
  storageBucket: "ai-bord-f930c.firebasestorage.app",
  messagingSenderId: "623327331173",
  appId: "1:623327331173:web:e21d0a9da1c3546d69578c",
  measurementId: "G-8R0ME78GVL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

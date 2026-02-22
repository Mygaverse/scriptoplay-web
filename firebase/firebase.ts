// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmVzC2Uq6RlQeC5cNVoJ0RlZbDRwG-iFo",
  authDomain: "scriptoplay-web.firebaseapp.com",
  projectId: "scriptoplay-web",
  storageBucket: "scriptoplay-web.firebasestorage.app",
  messagingSenderId: "982161799657",
  appId: "1:982161799657:web:973a0d4da5b7daa796f378",
  measurementId: "G-SGH4SH3044"
};

// 1. Initialize App (Singleton Pattern for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Services

export const auth = getAuth(app);
export const db = getFirestore(app, 'scriptoplay-web');
export const storage = getStorage(app, "gs://scriptoplay-web.firebasestorage.app");

// 3. Initialize Analytics (SAFELY)
let analytics;

// Check if we are running in the browser (window exists)
if (typeof window !== "undefined") {
  // Check if Analytics is supported in this environment
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
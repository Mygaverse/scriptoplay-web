// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmVzC2Uq6RlQeC5cNVoJ0RlZbDRwG-iFo",
  authDomain: "scriptoplay-web.firebaseapp.com",
  projectId: "scriptoplay-web",
  storageBucket: "scriptoplay-web.firebasestorage.app",
  messagingSenderId: "982161799657",
  appId: "1:982161799657:web:973a0d4da5b7daa796f378",
  measurementId: "G-SGH4SH3044"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

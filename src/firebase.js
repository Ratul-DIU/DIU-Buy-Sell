import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Optional analytics import if needed:
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDX9Y-AAFus5iNlPdyKlIBEwcdjfUcY1yw",
  authDomain: "diu-buy-and-sell.firebaseapp.com",
  projectId: "diu-buy-and-sell",
  storageBucket: "diu-buy-and-sell.firebasestorage.app",
  messagingSenderId: "777134633395",
  appId: "1:777134633395:web:32e19c1d695f7dc2261bc6",
  measurementId: "G-PY8ZF0LHKS"
};

// Initialize Firebase app only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Optional analytics initialization (if you want it)
let analytics;
if (typeof window !== "undefined") {
  // uncomment if you want analytics
  // analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
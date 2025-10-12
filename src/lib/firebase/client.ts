
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2cQ5WQp64xfXHbK7jJTgGIYWLtv_DHz0",
  authDomain: "gen-lang-client-0909854266.firebaseapp.com",
  projectId: "gen-lang-client-0909854266",
  storageBucket: "gen-lang-client-0909854266.appspot.com",
  messagingSenderId: "400406565295",
  appId: "1:400406565295:web:setup"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("Firebase initialized successfully.");

export { app, auth, db, storage };

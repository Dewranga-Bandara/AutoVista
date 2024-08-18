// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "autovista-2a270.firebaseapp.com",
  projectId: "autovista-2a270",
  storageBucket: "autovista-2a270.appspot.com",
  messagingSenderId: "755943579978",
  appId: "1:755943579978:web:2a5a911d9689de6a28a1b3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db: Firestore = getFirestore(app);
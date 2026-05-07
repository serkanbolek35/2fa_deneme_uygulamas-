import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDENKkcS1VZu9-L05Rdxl5nY6aUn6SkDnk",
  authDomain: "deneme-8a625.firebaseapp.com",
  projectId: "deneme-8a625",
  storageBucket: "deneme-8a625.firebasestorage.app",
  messagingSenderId: "619728243691",
  appId: "1:619728243691:web:c31a9dd97b1d606c4667ae"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
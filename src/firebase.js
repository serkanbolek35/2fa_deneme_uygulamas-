import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 🔧 BURAYA KENDİ FIREBASE YAPILANDIRMANIZI GİRİN
// Firebase Console > Project Settings > Your apps > SDK Setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;

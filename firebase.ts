import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC70KJvVBkc7BYkQxy2hodHAtdJWFNzMZk",
  authDomain: "citypeak-8236e.firebaseapp.com",
  projectId: "citypeak-8236e",
  storageBucket: "citypeak-8236e.firebasestorage.app",
  messagingSenderId: "199545157559",
  appId: "1:199545157559:web:5dcf3daa75200c55175a32",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
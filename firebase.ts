import { initializeApp } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FirebaseAuth from "firebase/auth";
import {
  getAuth,
  initializeAuth,
  type Persistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyC70KJvVBkc7BYkQxy2hodHAtdJWFNzMZk",
  authDomain: "citypeak-8236e.firebaseapp.com",
  projectId: "citypeak-8236e",
  storageBucket: "citypeak-8236e.firebasestorage.app",
  messagingSenderId: "199545157559",
  appId: "1:199545157559:web:5dcf3daa75200c55175a32",
};

const app = initializeApp(firebaseConfig);
// Metro resolves Firebase's React Native export, which includes this platform-only helper.
const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
  }
).getReactNativePersistence;

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
export const db = getFirestore(app);

export default app;

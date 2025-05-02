import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZ0opiVWQX4sGU66mKgVyj_O4bkQJ_tGE",
  authDomain: "casino-740a5.firebaseapp.com",
  projectId: "casino-740a5",
  storageBucket: "casino-740a5.appspot.com",
  messagingSenderId: "702590022500",
  appId: "1:702590022500:web:784ae0c228f30f93d34071"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // Правильная инициализация Firestore

export { 
  auth,
  googleProvider,
  db,
  createUserWithEmailAndPassword,
  signInWithPopup
};

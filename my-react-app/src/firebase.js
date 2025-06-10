import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDb8U7YtetZuUdAa1Uxa8_a0OSxCA6rlyo",
  authDomain: "react-to-do-app-fbda1.firebaseapp.com",
  projectId: "react-to-do-app-fbda1",
storageBucket: "react-to-do-app-fbda1.appspot.com",
  messagingSenderId: "982911359523",
  appId: "1:982911359523:web:8a50588084594aab7def96"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

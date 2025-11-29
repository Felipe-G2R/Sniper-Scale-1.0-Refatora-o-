import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration for user data and authentication (DB2)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: For production applications, it's highly recommended to use environment variables to store your Firebase config.
const firebaseConfig = {
  apiKey: "AIzaSyCaszjxSeyGqcP2DmVl7gWQ9YGgvFrkEhw",
  authDomain: "next-diamont-mvp.firebaseapp.com",
  projectId: "next-diamont-mvp",
  storageBucket: "next-diamont-mvp.appspot.com",
  messagingSenderId: "91112696499",
  appId: "1:91112696499:web:7dbe69c4f6f928080c5ec6",
  measurementId: "G-HWRF9WFJEG",
  databaseURL: "https://next-diamont-mvp.firebaseio.com/" // User Data Database (DB2)
};

// URL for the read-only knowledge base database (DB1)
const knowledgeBaseURL = "https://next-diamont-mvp-default-rtdb.firebaseio.com/";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// This rtdb instance is connected to the user data database (DB2) specified in firebaseConfig
export const rtdb = getDatabase(app);

// This knowledgeDB instance is specifically connected to the knowledge base database (DB1)
export const knowledgeDB = getDatabase(app, knowledgeBaseURL);

export default app;
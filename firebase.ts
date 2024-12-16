// firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyA77MNzv0Fe2x3SqEKRQUgM_CUcbJ9_o44",
    authDomain: "final-year-project-5f26d.firebaseapp.com",
    databaseURL: "https://final-year-project-5f26d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "final-year-project-5f26d",
    storageBucket: "final-year-project-5f26d.firebasestorage.app",
    messagingSenderId: "742653001503",
    appId: "1:742653001503:web:cb7d9f06b275cb118cfa2a",
    measurementId: "G-DR2ZRLV95V"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export default { app, database };

// Import the functions you need from the SDKs you need
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

export const firebaseConfig = {
    apiKey: "AIzaSyDN5NTJpO1IHYmy0EE1LQ3Kvk88Aw6eGAc",
    authDomain: "weyer-9c4be.firebaseapp.com",
    projectId: "weyer-9c4be",
    storageBucket: "weyer-9c4be.firebasestorage.app",
    messagingSenderId: "388394426694",
    appId: "1:388394426694:web:91ef31886ef6ba6a050547",
    measurementId: "G-58MK7PBKYX"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
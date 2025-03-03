// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAB656GnEUVrv9NNsra8lhMe0ouwfpj8A",
  authDomain: "lostandfound-9404c.firebaseapp.com",
  projectId: "lostandfound-9404c",
  storageBucket: "lostandfound-9404c.firebasestorage.app",
  messagingSenderId: "149054838691",
  appId: "1:149054838691:web:58916c149ff634a01fec16",
  measurementId: "G-3RED57SZH8"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { auth, db };
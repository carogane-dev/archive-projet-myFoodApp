import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Pour Realtime DB (si nécessaire)

const firebaseConfig = {
  apiKey: "AIzaSyChtROJiskvJDEFeeX3ilGs7EakmcQVEoo",
  authDomain: "mon-objectif-23649.firebaseapp.com",
  projectId: "mon-objectif-23649",
  storageBucket: "mon-objectif-23649.appspot.com",
  messagingSenderId: "404053450488",
  appId: "1:404053450488:web:7da0f22fbe77b46033250d",
  measurementId: "G-8NSPT5V36C",
  databaseURL: "https://mon-objectif-23649-default-rtdb.firebaseio.com", // Pour Realtime DB si utilisé
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig); // Si aucune app n'est initialisée, initialise une nouvelle app
} else {
  app = getApp(); // Si Firebase est déjà initialisé, récupère l'app existante
}

const auth = getAuth(app); // Authentification
const db = getFirestore(app); // Firestore (Base de données)
const realTimeDb = getDatabase(app); // Realtime Database (si nécessaire)

export { db, auth, realTimeDb };

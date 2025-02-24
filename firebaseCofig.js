// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";

const firebaseConfig = {
    apiKey: "AIzaSyChtROJiskvJDEFeeX3ilGs7EakmcQVEoo",
    authDomain: "mon-objectif-23649.firebaseapp.com",
    databaseURL: "https://mon-objectif-23649-default-rtdb.firebaseio.com",
    projectId: "mon-objectif-23649",
    storageBucket: "mon-objectif-23649.firebasestorage.app",
    messagingSenderId: "404053450488",
    appId: "1:404053450488:web:7da0f22fbe77b46033250d",
    measurementId: "G-8NSPT5V36C"
};

// Initialiser l'application Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore
const db = getFirestore(app);

// Initialiser l'authentification avec la persistance adaptée à React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { db, auth };

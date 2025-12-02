import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- COLLEZ VOS CLÉS ICI (Celles de l'étape 2) ---
const firebaseConfig = {
    apiKey: "AIzaSyAM2GR307xn4V81zGp8gSDNJFrHYHvbDj8",
  authDomain: "fkmap-e6d9e.firebaseapp.com",
  projectId: "fkmap-e6d9e",
  storageBucket: "fkmap-e6d9e.firebasestorage.app",
  messagingSenderId: "698258398584",
  appId: "1:698258398584:web:e4c7dc80da60c8a7783c8d",
  measurementId: "G-W5K6SCLNJ5"

};
// ------------------------------------------------

// Initialisation de Firebase
export const app = initializeApp(firebaseConfig);

// On exporte les outils pour les utiliser dans l'app
export const auth = getAuth(app);      // Pour la connexion
export const db = getFirestore(app);   // Pour la base de données
// ═══════════════════════════════════════════════════
//  Firebase Configuration — RMK Garage Slot Booking
// ═══════════════════════════════════════════════════
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAykMSkadyGh56rV0b3r1Ht149LjeAOJZg",
  authDomain: "slot-booking-88d32.firebaseapp.com",
  databaseURL: "https://slot-booking-88d32-default-rtdb.firebaseio.com",
  projectId: "slot-booking-88d32",
  storageBucket: "slot-booking-88d32.firebasestorage.app",
  messagingSenderId: "767296610303",
  appId: "1:767296610303:web:3eaf538ad3b51a451511ca",
  measurementId: "G-XY3MD2BSMP",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const analytics = getAnalytics(app);
export default app;

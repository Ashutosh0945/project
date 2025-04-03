import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCI3K2COSp13E0CyapdnPjK2mir-PErV-M",
  authDomain: "fitnessmap-7378b.firebaseapp.com",
  databaseURL: "https://fitnessmap-7378b-default-rtdb.firebaseio.com",
  projectId: "fitnessmap-7378b",
  storageBucket: "fitnessmap-7378b.firebasestorage.app",
  messagingSenderId: "287270588623",
  appId: "1:287270588623:web:3ab3cf9c2489897219e7ba",
  measurementId: "G-RH18YH785V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database }; 
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";
import { getVertexAI } from "firebase/vertexai";
import { getFirestore } from 'firebase/firestore';
import { getStripePayments } from '@invertase/firestore-stripe-payments';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDjx3BINgvUwR1CHE80yX1gCBXYl5OMCqs",
  authDomain: "rtd-academy.firebaseapp.com",
  databaseURL: "https://rtd-academy-default-rtdb.firebaseio.com",
  projectId: "rtd-academy",
  storageBucket: "rtd-academy.appspot.com",
  messagingSenderId: "406494878558",
  appId: "1:406494878558:web:7d69901b5b089ac2cf0dcf",
  measurementId: "G-PDQPPYM0BB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
export const database = getDatabase(app);
export const functions = getFunctions(app, 'us-central1');
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const vertexAI = getVertexAI(app);
export const storage = getStorage(app);

// Connect to Firebase emulators if the USE_EMULATORS env variable is set
if (process.env.REACT_APP_USE_EMULATORS === 'true') {
  // Connect to Functions emulator
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Connected to Firebase Functions emulator');

  // Connect to Realtime Database emulator
  import('firebase/database').then(({ connectDatabaseEmulator }) => {
    connectDatabaseEmulator(database, 'localhost', 8765);
    console.log('Connected to Firebase Realtime Database emulator');
  });
} else {
  console.log('Using production Firebase services');
}

// Initialize Stripe Payments
export const payments = getStripePayments(app, {
  productsCollection: 'products',
  customersCollection: 'customers',
  firebase: {
    firestore: firestore
  }
});

export default app;
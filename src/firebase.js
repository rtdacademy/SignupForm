import { initializeApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";
import { getVertexAI } from "firebase/vertexai";
import { getFirestore } from '@firebase/firestore';
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
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const vertexAI = getVertexAI(app);
export const storage = getStorage(app);

// Initialize Stripe Payments
export const payments = getStripePayments(app, {
  productsCollection: 'products',
  customersCollection: 'customers',
  firebase: {
    firestore: firestore
  }
});

export default app;
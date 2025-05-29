import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAnalytics } from "firebase/analytics";
import { getVertexAI } from "firebase/vertexai";
import { getFirestore } from 'firebase/firestore';
import { getStripePayments } from '@invertase/firestore-stripe-payments';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyDjx3BINgvUwR1CHE80yX1gCBXYl5OMCqs",
  authDomain: "yourway.rtdacademy.com",
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

// Initialize App Check with reCAPTCHA v3
let appCheck;
try {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LdlsUkrAAAAAOQysMd45vY2NChKWElYMe0uXGd7'),
    isTokenAutoRefreshEnabled: true
  });
  console.log('App Check initialized successfully');
} catch (error) {
  console.error('Error initializing App Check:', error);
}

// Connect to Firebase emulators based on environment variables
if (process.env.REACT_APP_USE_FUNCTIONS_EMULATOR === 'true') {
  // Connect to Functions emulator
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Connected to Firebase Functions emulator');
}

if (process.env.REACT_APP_USE_DATABASE_EMULATOR === 'true') {
  // Connect to Realtime Database emulator
  import('firebase/database').then(({ connectDatabaseEmulator }) => {
    connectDatabaseEmulator(database, 'localhost', 8765);
    console.log('Connected to Firebase Realtime Database emulator');
  });
}

// Log which services are being used
if (process.env.REACT_APP_USE_FUNCTIONS_EMULATOR !== 'true' && process.env.REACT_APP_USE_DATABASE_EMULATOR !== 'true') {
  console.log('Using all production Firebase services');
} else {
  if (process.env.REACT_APP_USE_FUNCTIONS_EMULATOR !== 'true') {
    console.log('Using production Firebase Functions');
  }
  if (process.env.REACT_APP_USE_DATABASE_EMULATOR !== 'true') {
    console.log('Using production Firebase Realtime Database');
  }
}

// Initialize Stripe Payments
export const payments = getStripePayments(app, {
  productsCollection: 'products',
  customersCollection: 'customers',
  firebase: {
    firestore: firestore
  }
});

export { appCheck };
export default app;
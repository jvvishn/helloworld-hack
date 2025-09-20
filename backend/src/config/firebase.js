// BEGIN FILE: firebase.js
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
require('dotenv').config();
const path = require('path');

// Load service account key JSON directly. This is a great way to handle credentials!
const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

// Client-side Firebase config (optional, but good to have)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize client-side Firebase
const clientApp = initializeApp(firebaseConfig);

module.exports = {
  admin,
  clientApp,
  db: admin.firestore(),
  auth: admin.auth(),
  storage: admin.storage()
};
// END FILE: firebase.js
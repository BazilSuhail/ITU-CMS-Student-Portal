import firebase from 'firebase/compat/app';
import { useEffect, useState } from "react";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';


const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const fs = firebase.firestore();
const st = firebase.storage();
const FieldValue = firebase.firestore.FieldValue;

const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = auth.onAuthStateChanged(user => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { currentUser: auth.currentUser, loading };
};

export { auth, fs, st, FieldValue, useFirebaseAuth }
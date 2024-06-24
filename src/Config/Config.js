import firebase from 'firebase/compat/app';
import { useEffect, useState } from "react";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
/*
const firebaseConfig = {
  apiKey: "AIzaSyDjAYnLTDqSCh4TV6rC7hef6cDtUwHHsFE",
  authDomain: "aisaar.firebaseapp.com",
  databaseURL: "https://aisaar-default-rtdb.firebaseio.com",
  projectId: "aisaar",
  storageBucket: "aisaar.appspot.com",
  messagingSenderId: "792015739092",
  appId: "1:792015739092:web:363f7416fbac2aef934341",
  measurementId: "G-PJDEFGBXRR"
};
*/
const firebaseConfig = {
    apiKey: "AIzaSyAZl78ABlOT-p29czm7pc79AiUcYssqKYI",
    authDomain: "itu-cms.firebaseapp.com",
    projectId: "itu-cms",
    storageBucket: "itu-cms.appspot.com",
    messagingSenderId: "442793159184",
    appId: "1:442793159184:web:e121dacdbf26e5805bf895",
    measurementId: "G-X66E0GNGH4"
  };/*
const firebaseConfig = {
  apiKey: "AIzaSyCh1HTmU0Eoaojgi7nnWxQlqoIvt-MvL4k",
  authDomain: "charity-management-syste-6c5f7.firebaseapp.com",
  databaseURL: "https://charity-management-syste-6c5f7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "charity-management-syste-6c5f7",
  storageBucket: "charity-management-syste-6c5f7.appspot.com",
  messagingSenderId: "533819495425",
  appId: "1:533819495425:web:879fba64f8eec103531c00",
  measurementId: "G-FBVBWL9BSZ"
};
*/
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
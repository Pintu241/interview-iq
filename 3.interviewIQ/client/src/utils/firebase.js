
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: "AIzaSyDwOUmIumAWf21VF3mFWJjlvrzJOpS0oTg",
  authDomain: "interviewiq-ef415.firebaseapp.com",
  projectId: "interviewiq-ef415",
  storageBucket: "interviewiq-ef415.firebasestorage.app",
  messagingSenderId: "959034615930",
  appId: "1:959034615930:web:2efe4d9e818bc4526973c3",
  measurementId: "G-2P4M2560LD"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}


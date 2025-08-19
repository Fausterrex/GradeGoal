import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9b8_ssZDagQ_BFULum_lGJjw-Z-IK_pY",
  authDomain: "grade-goal.firebaseapp.com",
  projectId: "grade-goal",
  storageBucket: "grade-goal.firebasestorage.app",
  messagingSenderId: "1058949248764",
  appId: "1:1058949248764:web:e4c320be1ab253f6008979",
  measurementId: "G-CY2MZZH8W2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('public_profile');
facebookProvider.addScope('email');

export { app, auth, googleProvider, facebookProvider };

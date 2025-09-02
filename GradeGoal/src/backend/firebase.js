/**
 * Firebase Configuration and Authentication Setup
 * 
 * This module configures Firebase for the GradeGoal application, including:
 * - Firebase app initialization with environment-based configuration
 * - Authentication setup with Google and Facebook providers
 * - Provider configuration for social login features
 * 
 * Environment variables are used for security to keep API keys private.
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

/**
 * Firebase configuration object
 * 
 * Contains all necessary Firebase project settings including API keys,
 * project ID, and authentication domain. Values are loaded from
 * environment variables for security.
 * 
 * @type {Object}
 * @property {string} apiKey - Firebase API key for project authentication
 * @property {string} authDomain - Firebase authentication domain
 * @property {string} projectId - Firebase project identifier
 * @property {string} storageBucket - Firebase storage bucket URL
 * @property {string} messagingSenderId - Firebase messaging sender ID
 * @property {string} appId - Firebase application ID
 * @property {string} measurementId - Firebase analytics measurement ID
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Initialize Firebase application
 * 
 * Creates and configures the Firebase app instance using the provided configuration.
 * This is the main entry point for all Firebase services.
 * 
 * @type {Object} Firebase app instance
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance
 * 
 * Provides authentication services including user sign-in, sign-out,
 * and user state management. Used throughout the application for
 * user authentication and session management.
 * 
 * @type {Object} Firebase Auth instance
 */
const auth = getAuth(app);

/**
 * Google Authentication Provider
 * 
 * Configures Google sign-in authentication for the application.
 * Allows users to sign in using their Google accounts.
 * 
 * @type {Object} Google Auth Provider instance
 */
const googleProvider = new GoogleAuthProvider();

/**
 * Facebook Authentication Provider
 * 
 * Configures Facebook sign-in authentication for the application.
 * Allows users to sign in using their Facebook accounts.
 * Includes necessary scopes for profile and email access.
 * 
 * @type {Object} Facebook Auth Provider instance
 */
const facebookProvider = new FacebookAuthProvider();

// Configure Facebook provider with required scopes
facebookProvider.addScope("public_profile");
facebookProvider.addScope("email");

/**
 * Export Firebase instances and providers
 * 
 * Makes Firebase services available to other parts of the application.
 * Components can import these to access authentication and other Firebase features.
 */
export { app, auth, googleProvider, facebookProvider };

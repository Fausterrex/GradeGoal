import React, { useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../backend/firebase';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
const AuthContext = React.createContext();

/**
 * Custom hook to use authentication context
 * @returns {Object} Authentication context value
 */
export function useAuth() {
    return useContext(AuthContext);
}

/**
 * AuthProvider Component
 * 
 * Provides authentication context to the application.
 * Manages user authentication state, login, signup, and logout functionality.
 * Integrates with Firebase Authentication for user management.
 * 
 * @param {ReactNode} children - Child components to wrap with auth context
 */
export function AuthProvider({ children }) {
    // Authentication state
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    /**
     * Create a new user account with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise} Firebase authentication promise
     */
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    /**
     * Sign in existing user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise} Firebase authentication promise
     */
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    /**
     * Login with user ID (placeholder function for future implementation)
     * @param {string} uid - User ID
     * @returns {Promise} Resolved promise (placeholder)
     */
    function loginWithUid(uid) {
        return Promise.resolve();
    }

    /**
     * Update current user with additional data
     * Merges user data with existing Firebase user or current user state
     * @param {Object} userData - Additional user data to merge
     * @returns {Object} Updated user object
     */
    function updateCurrentUserWithData(userData) {
        const firebaseUser = auth.currentUser;
        
        if (firebaseUser && userData) {
            const updatedUser = {
                ...firebaseUser,
                ...userData
            };
    
            setCurrentUser(updatedUser);
            return updatedUser;
        } else if (currentUser && userData) {
            const updatedUser = {
                ...currentUser,
                ...userData
            };
    
            setCurrentUser(updatedUser);
            return updatedUser;
        }
        return currentUser;
    }

    /**
     * Refresh current user data from Firebase
     * @returns {Promise} Promise resolving to current Firebase user or rejecting if no user
     */
    function refreshCurrentUser() {
        return auth.currentUser ? Promise.resolve(auth.currentUser) : Promise.reject('No user');
    }

    /**
     * Sign out the current user
     * @returns {Promise} Firebase sign out promise
     */
    function logout() {
        return signOut(auth);
    }

    /**
     * Send password reset email to user
     * @param {string} email - User's email address
     * @returns {Promise} Firebase password reset promise
     */
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    /**
     * Listen for authentication state changes
     * Updates currentUser state when user signs in/out
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Context value object
    const value = {
        currentUser,
        loading,
        signup,
        login,
        loginWithUid,
        updateCurrentUserWithData,
        refreshCurrentUser,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}


// ========================================
// AUTHENTICATION CONTEXT
// ========================================
// This context provides authentication state and methods throughout the application.
// It manages user login, logout, registration, and password reset functionality
// using Firebase Authentication.

import React, { useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../backend/firebase";

const AuthContext = React.createContext();

// Hook to access authentication context
export function useAuth() {
  return useContext(AuthContext);
}

// Authentication provider component that wraps the entire application
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Creates a new user account with email and password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Signs in an existing user with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Placeholder for UID-based login (not implemented)
  function loginWithUid(uid) {
    return Promise.resolve();
  }

  // Updates the current user data in the context state
  function updateCurrentUserWithData(userData) {
    const firebaseUser = auth.currentUser;

    if (firebaseUser && userData) {
      const updatedUser = {
        ...firebaseUser,
        ...userData,
      };

      setCurrentUser(updatedUser);
      // Set user role if provided
      if (userData.role) {
        setUserRole(userData.role);
        localStorage.setItem('userRole', userData.role);
      }
      return updatedUser;
    } else if (currentUser && userData) {
      const updatedUser = {
        ...currentUser,
        ...userData,
      };

      setCurrentUser(updatedUser);
      // Set user role if provided
      if (userData.role) {
        setUserRole(userData.role);
        localStorage.setItem('userRole', userData.role);
      }
      return updatedUser;
    }
    return currentUser;
  }

  // Refreshes the current user from Firebase
  function refreshCurrentUser() {
    return auth.currentUser
      ? Promise.resolve(auth.currentUser)
      : Promise.reject("No user");
  }

  // Signs out the current user
  function logout() {
    setUserRole(null);
    localStorage.removeItem('userRole');
    return signOut(auth);
  }

  // Sends password reset email to the specified email address
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserRole(null);
        localStorage.removeItem('userRole');
      } else {
        // Try to get user role from localStorage first
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(storedRole);
        } else {
          // Fetch user role from database
          try {
            const { getUserProfile } = await import('../backend/api');
            const userProfile = await getUserProfile(user.email);
            const role = userProfile?.role || 'USER';
            setUserRole(role);
            localStorage.setItem('userRole', role);
          } catch (error) {
            console.error('Failed to fetch user role:', error);
            setUserRole('USER'); // Default to USER
            localStorage.setItem('userRole', 'USER');
          }
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    loginWithUid,
    updateCurrentUserWithData,
    refreshCurrentUser,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

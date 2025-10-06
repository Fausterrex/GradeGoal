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
  const context = useContext(AuthContext);
  return context;
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
        // Preserve userId if it exists in current user but not in userData
        userId: userData.userId || currentUser?.userId || null,
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
        // Preserve userId if it exists in current user but not in userData
        userId: userData.userId || currentUser?.userId || null,
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
    if (auth.currentUser) {
      const refreshedUser = {
        ...auth.currentUser,
        // Preserve userId from current user
        userId: currentUser?.userId || null,
      };
      
      
      setCurrentUser(refreshedUser);
      return Promise.resolve(refreshedUser);
    }
    return Promise.reject("No user");
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
      if (!user) {
        setCurrentUser(null);
        setUserRole(null);
        localStorage.removeItem('userRole');
        setLoading(false);
        return;
      }


      try {
        // Fetch user profile from database to get firstName, lastName, and role
        const { getUserProfile } = await import('../backend/api');
        const userProfile = await getUserProfile(user.email);
        
        // Merge Firebase user data with database profile data
        const enhancedUser = {
          ...user,
          userId: userProfile?.userId || null, // Add userId from database
          firstName: userProfile?.firstName || '',
          lastName: userProfile?.lastName || '',
          displayName: userProfile?.firstName && userProfile?.lastName 
            ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
            : user.displayName || '',
          role: userProfile?.role || 'USER'
        };
        
        setCurrentUser(enhancedUser);
        
        // Set user role
        const role = userProfile?.role || 'USER';
        setUserRole(role);
        localStorage.setItem('userRole', role);
        
        // Update login streak for automatic login (page refresh, etc.)
        if (enhancedUser.userId) {
          try {
            const { updateUserLoginStreak } = await import('../backend/api');
            await updateUserLoginStreak(enhancedUser.userId);
            console.log('✅ Login streak updated automatically');
          } catch (error) {
            console.error('❌ Failed to update login streak automatically:', error);
            // Don't fail the authentication if streak update fails
          }
        }
        
      } catch (error) {
        console.error('AuthContext: Failed to fetch user profile:', error);
        // Fallback to Firebase user data only
        const fallbackUser = {
          ...user,
          userId: null,
          firstName: '',
          lastName: '',
          role: 'USER'
        };
        setCurrentUser(fallbackUser);
        setUserRole('USER');
        localStorage.setItem('userRole', 'USER');
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

import React, { useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../backend/firebase';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithUid(uid) {
        return Promise.resolve();
    }

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

    function refreshCurrentUser() {
        return auth.currentUser ? Promise.resolve(auth.currentUser) : Promise.reject('No user');
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

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


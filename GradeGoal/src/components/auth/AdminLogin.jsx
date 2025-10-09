// ========================================
// ADMIN LOGIN COMPONENT
// ========================================
// This component provides a dedicated admin login interface
// that redirects to the admin dashboard upon successful authentication

import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../backend/firebase";
import { loginUser, getUserProfile } from "../../backend/api";

function AdminLogin() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { updateCurrentUserWithData } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handles admin login form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const email = (emailRef.current.value || "").trim();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (passwordRef.current.value.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    try {
      setError("");
      setLoading(true);

      const password = passwordRef.current.value;
      
      // Authenticate with Firebase
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = cred.user;
      
      // Get user profile to check role
      const userProfile = await getUserProfile(firebaseUser.email);

      // Check if user is an admin
      if (!userProfile || userProfile.role !== "ADMIN") {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      // Check if account is active
      if (userProfile.isActive === false) {
        setError("Your admin account has been deactivated. Please contact support.");
        setLoading(false);
        return;
      }

      // Update user data in context
      const userData = {
        userId: userProfile.userId,
        email: firebaseUser.email,
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        displayName: userProfile.firstName && userProfile.lastName 
          ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
          : firebaseUser.displayName || '',
        role: userProfile.role
      };

      updateCurrentUserWithData(userData);

      // Redirect to admin dashboard
      navigate("/admin");
      
    } catch (error) {
      console.error("Admin login error:", error);
      if (error.code === "auth/user-not-found") {
        setError("No admin account found with this email address.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Failed to sign in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-gray-300">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Address
              </label>
              <input
                id="email"
                type="email"
                ref={emailRef}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="admin@gradegoal.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  ref={passwordRef}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in to Admin Dashboard"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              ← Back to User Login
            </Link>
            <div className="text-xs text-gray-500">
              Admin access is restricted to authorized personnel only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

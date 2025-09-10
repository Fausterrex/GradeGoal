// ========================================
// PRIVATE ROUTE COMPONENT
// ========================================
// This component protects routes that require authentication.
// It checks if a user is logged in and either renders the protected component
// or redirects to the login page.

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ component: Component, ...rest }) {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B389f] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render component if authenticated, otherwise redirect to login
  return currentUser ? <Component {...rest} /> : <Navigate to="/login" />;
}

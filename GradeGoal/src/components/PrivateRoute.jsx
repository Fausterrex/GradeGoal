import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * PrivateRoute Component
 * 
 * Route protection component that ensures only authenticated users can access protected routes.
 * Shows loading state while checking authentication and redirects to login if not authenticated.
 * 
 * @param {React.Component} component - The component to render if authenticated
 * @param {Object} rest - Additional props to pass to the component
 * @returns {React.Component} The protected component or redirect to login
 */
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
// ========================================
// MAIN APPLICATION COMPONENT
// ========================================
// This is the root component that sets up routing, authentication context,
// and defines all application routes for the GradeGoal system.

import React from "react";
import Signup from "./auth/signup";
import Login from "./auth/login";
import ForgotPassword from "./auth/forgotpassword";
import Landingpage from "./auth/landingpage";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from "./dashboard/MainDashboard";
import PrivateRoute from "./PrivateRoute";
import Header from "./auth/Header";
import AdminDashboard from "./admin/AdminDashboard";

// Role-based routing component
function AppRoutes() {
  const { userRole, loading } = useAuth();

  // Show loading spinner while determining user role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
              {/* ========================================
                  LANDING PAGE ROUTE
                  ======================================== */}
              <Route
                path="/"
                element={
                  <div className="flex flex-col h-screen w-full">
                    <Header />
                    <div className="flex-1 overflow-hidden w-1xl mx-auto">
                      <Landingpage />
                    </div>
                  </div>
                }
              />

              {/* ========================================
                  ADMIN DASHBOARD ROUTES
                  ======================================== */}
              {userRole === 'ADMIN' && (
                <>
                  <Route
                    path="/admin"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={AdminDashboard}
                          requiredRole="ADMIN"
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={AdminDashboard}
                          requiredRole="ADMIN"
                        />
                      </div>
                    }
                  />
                </>
              )}

              {/* ========================================
                  USER DASHBOARD ROUTES
                  ======================================== */}
              {userRole === 'USER' && (
                <>
                  <Route
                    path="/dashboard"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="overview"
                          requiredRole="USER"
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/dashboard/courses"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="courses"
                          requiredRole="USER"
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/dashboard/goals"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="goals"
                          requiredRole="USER"
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/dashboard/reports"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="reports"
                          requiredRole="USER"
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/dashboard/calendar"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="calendar"
                          requiredRole="USER"
                        />
                      </div>
                    }
                  />
                  <Route
                    path="/dashboard/course/:courseId"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="grades"
                          requiredRole="USER"
                        />
                      </div>
                    }
                  />
                </>
              )}

              {/* ========================================
                  AUTHENTICATION ROUTES
                  ======================================== */}
              <Route
                path="/signup"
                element={
                  <div className="flex flex-col h-screen w-full">
                    <Header />
                    <div className="flex-1 overflow-hidden w-1xl mx-auto">
                      <Signup />
                    </div>
                  </div>
                }
              />
              <Route
                path="/login"
                element={
                  <div className="flex flex-col h-screen w-full">
                    <Header />
                    <div className="flex-1 overflow-hidden">
                      <Login />
                    </div>
                  </div>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <div className="flex flex-col h-screen w-full">
                    <Header />
                    <div className="flex-1 overflow-hidden">
                      <ForgotPassword />
                    </div>
                  </div>
                }
              />
              
              {/* ========================================
                  FALLBACK ROUTE (for unauthenticated users)
                  ======================================== */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col h-screen w-full">
                    <Header />
                    <div className="flex-1 overflow-hidden w-1xl mx-auto">
                      <Landingpage />
                    </div>
                  </div>
                }
              />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      {/* ========================================
          ROUTER AND AUTH PROVIDER
          ======================================== */}
      <AuthProvider>
        {/* ========================================
            MAIN APP CONTAINER
            ======================================== */}
        <div className="min-h-screen flex flex-col bg-green-100">
          {/* ========================================
              MAIN CONTENT AREA
              ======================================== */}
          <main className="page flex items-center justify-center bg-white">
            {/* ========================================
                ROUTES CONFIGURATION
                ======================================== */}
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

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
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AchievementProvider, useAchievementNotifications } from "./context/AchievementContext";
import { YearLevelProvider } from "./context/YearLevelContext";
import { SemesterProvider } from "./context/SemesterContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from "./dashboard/MainDashboard";
import PrivateRoute from "./PrivateRoute";
import Header from "./auth/Header";
import Admin from "./admin/Admin";
import AchievementNotificationModal from "./modals/AchievementNotificationModal";
// Achievement Modal Manager Component
function AchievementModalManager() {
  const { currentNotification, isModalOpen, closeNotification } = useAchievementNotifications();

  if (!isModalOpen || !currentNotification) {
    return null;
  }

  return (
    <AchievementNotificationModal
      isOpen={isModalOpen}
      onClose={closeNotification}
      achievement={currentNotification.type === 'achievement' ? currentNotification.achievement : null}
      isLevelUp={currentNotification.type === 'levelup'}
      newLevel={currentNotification.type === 'levelup' ? currentNotification.newLevel : null}
      levelUpRewards={currentNotification.type === 'levelup' ? currentNotification.levelUpRewards : null}
    />
  );
}

// Role-based routing component
function AppRoutes() {
  const auth = useAuth();
  
  // Handle case where useAuth returns undefined
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  
  const { userRole, loading } = auth;

  // Show loading spinner while determining user role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
                          component={Admin}
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
                          component={Admin}
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
                    path="/dashboard/course/:id"
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
                  <Route
                    path="/dashboard/settings"
                    element={
                      <div className="flex flex-col h-screen w-full">
                        <PrivateRoute
                          component={MainDashboard}
                          initialTab="settings"
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
                  ADMIN ROUTE
                  ======================================== */}
              <Route
                path="/admin"
                element={
                  <div className="flex flex-col h-screen w-full">
                    <PrivateRoute
                      component={Admin}
                      requiredRole="ADMIN"
                    />
                  </div>
                }
              />

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
            ACHIEVEMENT PROVIDER (Global Achievement State)
            ======================================== */}
        <AchievementProvider>
          <YearLevelProvider>
            <SemesterProvider>
            {/* ========================================
                MAIN APP CONTAINER
                ======================================== */}
            <div className="min-h-screen flex flex-col bg-white">
            {/* ========================================
                MAIN CONTENT AREA
                ======================================== */}
            <main className="page flex items-center justify-center bg-white">
              {/* ========================================
                  ROUTES CONFIGURATION
                  ======================================== */}
              <AppRoutes />
            </main>
            
            {/* ========================================
                GLOBAL ACHIEVEMENT MODAL
                ======================================== */}
            <AchievementModalManager />
            </div>
            </SemesterProvider>
          </YearLevelProvider>
        </AchievementProvider>
        </AuthProvider>
      </Router>
    );
  }

export default App;

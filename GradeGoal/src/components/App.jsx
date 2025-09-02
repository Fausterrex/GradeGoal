import React from "react";
import Signup from "./signup";
import Login from "./login";
import ForgotPassword from "./forgotpassword";
import Landingpage from "./landingpage";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from './MainDashboard'
import PrivateRoute from "./PrivateRoute";
import Header from "./Header";

/**
 * App Component
 * 
 * Main application component that sets up routing and authentication context.
 * Defines all application routes and wraps components with necessary providers.
 * Handles public routes (landing, login, signup) and protected dashboard routes.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-green-100">
          <main className="page flex items-center justify-center bg-white">
            <Routes>
              {/* Landing Page Route */}
              <Route path="/" element={
                <div className="flex flex-col h-screen w-full">
                  <Header />
                  <div className="flex-1 overflow-hidden w-1xl mx-auto">
                    <Landingpage/>
                  </div>
                </div>
              }/>
              
              {/* Dashboard Routes - All Protected */}
              <Route path="/dashboard" element={
                <div className="flex flex-col h-screen w-full">
                  <PrivateRoute component={MainDashboard} initialTab="overview"/>
                </div>
              }/>
              <Route path="/dashboard/courses" element={
                <div className="flex flex-col h-screen w-full">
                  <PrivateRoute component={MainDashboard} initialTab="courses"/>
                </div>
              }/>
              <Route path="/dashboard/goals" element={
                <div className="flex flex-col h-screen w-full">
                  <PrivateRoute component={MainDashboard} initialTab="goals"/>
                </div>
              }/>
              <Route path="/dashboard/reports" element={
                <div className="flex flex-col h-screen w-full">
                  <PrivateRoute component={MainDashboard} initialTab="reports"/>
                </div>
              }/>
              <Route path="/dashboard/calendar" element={
                <div className="flex flex-col h-screen w-full">
                  <PrivateRoute component={MainDashboard} initialTab="calendar"/>
                </div>
              }/>
              
              {/* Authentication Routes - Public */}
              <Route path="/signup" element={
                <div className="flex flex-col h-screen w-full">
                  <Header />
                  <div className="flex-1 overflow-hidden w-1xl mx-auto">
                    <Signup/>
                  </div>
                </div>
              }/>
              <Route path="/login" element={
                <div className="flex flex-col h-screen w-full">
                  <Header />
                  <div className="flex-1 overflow-hidden">
                    <Login/>
                  </div>
                </div>
              }/>
              <Route path="/forgot-password" element={
                <div className="flex flex-col h-screen w-full">
                  <Header />
                  <div className="flex-1 overflow-hidden">
                    <ForgotPassword/>
                  </div>
                </div>
              }/>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

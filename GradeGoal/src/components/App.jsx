import React from "react";
import Signup from "./auth/signup";
import Login from "./auth/login";
import ForgotPassword from "./auth/forgotpassword";
import Landingpage from "./auth/landingpage";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from './dashboard/MainDashboard'
import PrivateRoute from "./PrivateRoute";
import Header from "./auth/Header";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-green-100">
          <main className="page flex items-center justify-center bg-white">
            <Routes>
              <Route path="/" element={
                <div className="flex flex-col h-screen w-full">
                  <Header />
                  <div className="flex-1 overflow-hidden w-1xl mx-auto">
                    <Landingpage/>
                  </div>
                </div>
              }/>

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

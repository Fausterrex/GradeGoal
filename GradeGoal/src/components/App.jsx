import React from "react";
import Signup from "./signup";
import Login from "./login";
import ForgotPassword from "./forgotpassword";
import Landingpage from "./landingpage";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './maindashboard'
import PrivateRoute from "./PrivateRoute";
import Header from "./Header";


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
              <Route path="/maindashboard" element={
                <div className="flex flex-col h-screen w-full">
                  <PrivateRoute component={Dashboard}/>
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
              <Route path="/landing"  element={<Landingpage/>}/>
            </Routes>
          </main>
          
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

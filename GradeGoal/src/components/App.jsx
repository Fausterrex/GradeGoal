import React from "react";
import Signup from "./signup";
import Login from "./login";
import ForgotPassword from "./forgotpassword";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './maindashboard'
import PrivateRoute from "./PrivateRoute";
import Header from "./Header";
import Landingpage from "./landingpage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-green-100">

          <main className="page flex flex items-center justify-center bg-white">
            <Routes>
              <Route path="/" element={<Login/>}/>
              <Route path="/maindashboard" element={<PrivateRoute component={Dashboard} />} />
              <Route path="/signup" element={<Signup/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/forgot-password" element={<ForgotPassword/>}/>
              <Route path="/landing"  element={<Landingpage/>}/>
            </Routes>
          </main>
          
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

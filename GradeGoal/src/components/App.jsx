import React from "react";
import Signup from "./signup";
import Login from "./login";
import ForgotPassword from "./ForgotPassword";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './maindashboard'
import PrivateRoute from "./PrivateRoute";
import Header from "./Header";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Login/>}/>
              <Route path="/maindashboard" element={<PrivateRoute component={Dashboard} />} />
              <Route path="/signup" element={<Signup/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/forgot-password" element={<ForgotPassword/>}/>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

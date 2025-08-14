import React from "react";
import Signup from "./signup";
import Login from "./login";
import { Container } from "react-bootstrap";
import { AuthProvider } from "../context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from './maindashboard'

function App() {
  return (

      <Container 
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-50" style={{ minWidth: "300px" }}>
          <Router>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/maindashboard" element={<Dashboard/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="/login" element={<Login/>}/>
              </Routes>
            </AuthProvider>
          </Router>
        </div>
      </Container>
  );
}

export default App;

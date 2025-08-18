import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header-container">
               {/* image dito */}
                <div className="logo">
                    <Link to="/" className="logo-text">LOGO</Link>
                </div>

                {/* wala pang routes and paths patungo sa kanya-kanya nilang files kaya blangko pa*/}
                <nav className="nav-links">
                    <Link to="/about" className="nav-link">About us</Link>
                    <Link to="/help" className="nav-link">Help</Link>
                    <Link to="/community" className="nav-link">Community</Link>
                </nav>

                <div className="auth-buttons">
                    <Link to="/login" className="login-link">Login</Link>
                    <Link to="/signup" className="signup-button">Sign up</Link>
                </div>
            </div>
        </header>
    );
}

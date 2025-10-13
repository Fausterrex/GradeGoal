// ========================================
// HEADER COMPONENT
// ========================================
// This component renders the main navigation header for the application.
// It includes the logo, navigation links, and authentication buttons.

import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../drawables/logo.svg";
import { HashLink } from "react-router-hash-link";
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-2 fixed top-0 left-0 right-0 z-50 m-0 p-0">
      {/* ========================================
          HEADER CONTAINER
          ======================================== */}
      {/* ========================================
          HEADER CONTENT WRAPPER
          ======================================== */}
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
        {/* ========================================
            LOGO SECTION
            ======================================== */}
        <div className="w-16 h-16 flex items-center justify-center">
          <Link to="/">
            <img
              src={Logo}
              alt="logo"
              className="h-12 w-12 object-contain"
            />
          </Link>
        </div>

        {/* ========================================
            NAVIGATION MENU
            ======================================== */}
        <nav
          className="hidden md:flex items-center space-x-8"
          aria-label="Main navigation"
        >
          <HashLink
            smooth
            to="#aboutUs"
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-500"
          >
            About us
          </HashLink>
          <Link
            to="/help"
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200"
          >
            Help
          </Link>
          <Link
            to="/community"
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200"
          >
            Community
          </Link>
        </nav>

        {/* ========================================
            AUTHENTICATION BUTTONS
            ======================================== */}
        <div className="flex items-center space-x-6">
          <Link
            to="/login"
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-[#3B389f] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#2d2a7a] transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

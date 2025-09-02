import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../drawables/logo.svg';

/**
 * Header Component
 * 
 * Main navigation header that appears on public pages (landing, login, signup).
 * Features the application logo, navigation links, and authentication buttons.
 * Sticky positioning ensures it remains visible during page scroll.
 */
export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="w-25 h-25 flex items-center justify-center">
          <Link to="/">
            <img src={Logo} alt='logo' className='h-auto w-auto object-obtain'/>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
          <Link to="/about" className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200">
            About us
          </Link>
          <Link to="/help" className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200">
            Help
          </Link>
          <Link to="/community" className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200">
            Community
          </Link>
        </nav>

        {/* Authentication Buttons */}
        <div className="flex items-center space-x-6">
          <Link to="/login" className="text-gray-500 text-sm hover:text-gray-700 transition-colors duration-200">
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

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../drawables/logo.png';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
        
        {/* Logo */}
        <div className="w-15 h-15 bg-gradient-to-r from-[#BE80FF] via-[#7538C4] to-[#7538C4] shadow-xl flex items-center justify-center rounded-full">
          <Link
            to="/landing"
          >
            <img src={Logo} alt='logo' className='h-auto w-auto object-obtain'/>
          </Link>
        </div>

        {/* Navigation */}
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

        {/* Auth Buttons */}
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

import { useState } from "react";
import logo from "../../drawables/logo.svg";
const LeftSidebar = ({ activeSection, onSectionChange, onLogout }) => {
  return (
    <aside className="lg:w-80 flex-shrink-0">
      <div className="top-4 space-y-6">
        {/* Logo/Profile Section */}
        <div className="p-2 bg-white rounded-xl shadow-sm text-center">
          <img
            src={logo}
            alt="Logo"
            className="w-40 h-40 rounded-xl mx-auto mt-2 mb-3 object-cover"
          />
          <h3 className="text-lg font-semibold text-gray-800">GradeGoal</h3>
          <p className="text-gray-600 text-sm">Admin</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Navigation</h3>
          <div className="space-y-2">
            <button
              onClick={() => onSectionChange('dashboard')}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                activeSection === 'dashboard'
                  ? 'bg-pink-50 border border-pink-200 text-pink-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-lg font-medium">📊 Overview</div>
              <div className="text-sm text-gray-500">Dashboard summary</div>
            </button>
            <button
              onClick={() => onSectionChange('students')}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                activeSection === 'students'
                  ? 'bg-pink-50 border border-pink-200 text-pink-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-lg font-medium">👨‍🎓 Students</div>
              <div className="text-sm text-gray-500">Manage students</div>
            </button>
            <button
              onClick={() => onSectionChange('courses')}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                activeSection === 'courses'
                  ? 'bg-pink-50 border border-pink-200 text-pink-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="text-lg font-medium">📚 Courses</div>
              <div className="text-sm text-gray-500">Course management</div>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
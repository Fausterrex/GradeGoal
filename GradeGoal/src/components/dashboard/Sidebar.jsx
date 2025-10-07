// ========================================
// SIDEBAR COMPONENT
// ========================================
// This component provides the main navigation sidebar
// Features: Navigation tabs, user profile, logout functionality

import React from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaBullseye,
  FaClipboardList,
  FaCalendarAlt,
  FaCog,
} from "react-icons/fa";
import { useYearLevel } from "../context/YearLevelContext";
const Sidebar = ({ activeTab, onTabClick, onLogout, displayName, tabs, isMobileSidebarOpen, setIsMobileSidebarOpen }) => {
  const { selectedYearLevel, changeYearLevel, getYearLevelLabel } = useYearLevel();
  // Navigation items configuration
  const navItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", tab: "overview" },
    { icon: <FaBook />, label: "Courses", tab: "courses" },
    { icon: <FaBullseye />, label: "Goals", tab: "goals" },
    { icon: <FaClipboardList />, label: "Reports", tab: "reports" },
    { icon: <FaCalendarAlt />, label: "Calendar", tab: "calendar" },
    { icon: <FaCog />, label: "Settings", tab: "settings" },
  ];

  return (
    <div className="w-60 h-screen bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white flex flex-col justify-between px-2 py-6 z-10 rounded-tr-4xl rounded-br-4xl overflow-hidden">
      <div className="space-y-6">
        {/* ========================================
            LOGO AND BRANDING
            ======================================== */}
        <div className="flex flex-col items-center justify-center text-2xl font-bold mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 ">
            <img 
              src="/src/drawables/logo.svg" 
              alt="Grade Goal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h2>Grade Goal</h2>
        </div>

        {/* ========================================
            YEAR LEVEL SELECTOR
            ======================================== */}
        <div className="mb-6 px-4">
          <label className="block text-sm font-medium text-white mb-2">
            Academic Year View
          </label>
          <select
            value={selectedYearLevel}
            onChange={(e) => {
              changeYearLevel(e.target.value);
            }}
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
          >
            <option value="all" className="text-gray-800">All Years</option>
            <option value="1" className="text-gray-800">1st Year</option>
            <option value="2" className="text-gray-800">2nd Year</option>
            <option value="3" className="text-gray-800">3rd Year</option>
            <option value="4" className="text-gray-800">4th Year</option>
          </select>
        </div>

        {/* ========================================
            NAVIGATION ITEMS
            ======================================== */}
        <div className="flex flex-col items-start space-y-6">
          {navItems.map((item) => (
            <NavItem
              key={item.tab}
              icon={item.icon}
              label={item.label}
              isActive={activeTab === item.tab}
        onClick={() => onTabClick(item.tab)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }) => (
  <div
    className={`flex items-center p-2 rounded-md cursor-pointer space-x-2 group w-full ${
      isActive ? "bg-[#6D4FC2] text-white" : ""
    }`}
    onClick={onClick}
  >
    <div
      className={`text-3xl ml-5 ${
        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
      }`}
    >
      {icon}
    </div>
    <span
      className={`text-xl font-medium mx-8 ${
        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
      }`}
    >
      {label}
    </span>
  </div>
);

export default Sidebar;

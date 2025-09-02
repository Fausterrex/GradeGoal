import React from 'react';
import { FaTachometerAlt, FaBook, FaBullseye, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';

/**
 * Sidebar Component
 * 
 * Provides navigation between different sections of the application.
 * Features a gradient background with active tab highlighting and hover effects.
 * 
 * @param {string} activeTab - The currently active tab
 * @param {Function} setActiveTab - Function to change the active tab
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  // Navigation items configuration
  const navItems = [
    { icon: <FaTachometerAlt />, label: 'Dashboard', tab: 'overview' },
    { icon: <FaBook />, label: 'Courses', tab: 'courses' },
    { icon: <FaBullseye />, label: 'Goals', tab: 'goals' },
    { icon: <FaClipboardList />, label: 'Reports', tab: 'reports' },
    { icon: <FaCalendarAlt />, label: 'Calendar', tab: 'calendar' },
  ];

  return (
    <div className="w-60 h-screen bg-gradient-to-b from-[#8168C5] to-[#3E325F] text-white flex flex-col justify-between px-2 py-6 z-10 rounded-tr-4xl rounded-br-4xl overflow-hidden">
      <div className="space-y-6">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center justify-center text-2xl font-bold mb-6">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2">
            <span className="text-[#8168C5] text-xl">GG</span>
          </div>
          <h2>Grade Goal</h2>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col items-start space-y-6">
          {navItems.map((item) => (
            <NavItem 
              key={item.tab}
              icon={item.icon} 
              label={item.label} 
              isActive={activeTab === item.tab}
              onClick={() => setActiveTab(item.tab)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * NavItem Component
 * 
 * Individual navigation item with icon, label, and active state styling.
 * 
 * @param {ReactNode} icon - The icon to display
 * @param {string} label - The label text for the navigation item
 * @param {boolean} isActive - Whether this item is currently active
 * @param {Function} onClick - Click handler for the navigation item
 */
const NavItem = ({ icon, label, isActive, onClick }) => (
  <div 
    className={`flex items-center p-2 rounded-md cursor-pointer space-x-2 group w-full ${
      isActive ? 'bg-[#6D4FC2] text-white' : ''
    }`}
    onClick={onClick}
  >
    <div className={`text-3xl ml-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
      {icon}
    </div>
    <span className={`text-xl font-medium mx-8 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
      {label}
    </span>
  </div>
);

export default Sidebar;

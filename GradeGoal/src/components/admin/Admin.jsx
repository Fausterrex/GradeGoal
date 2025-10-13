import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../drawables/logoGG.png";
import dummyProfile from "../../drawables/dummyprofile.webp";
import { Activity, Users, Brain, Trophy, LogOut } from "lucide-react";
import Overview from "./tabs/Overview";
import UserManagement from "./tabs/UserManagement";
import AIPrediction from "./tabs/AIPrediction";
import Gamification from "./tabs/Gamification";

function Admin() {
  const { currentUser, logout, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D4C5F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user is not authenticated or not admin
  if (!currentUser || userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D4C5F5]">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
    { id: "ai", label: "AI & Predictions", icon: <Brain size={16} /> },
    { id: "gamification", label: "Gamification", icon: <Trophy size={16} /> },
  ];

  return (
    <div className="flex flex-col w-full bg-[#D4C5F5] min-h-screen">
      {/* Header*/}
      <div className="flex flex-row w-full p-8 justify-between items-center bg-[#7e50e1e1] shadow-sm">
        {/* Logo + Title */}
        <div className="flex items-center gap-6 px-20">
          <img src={logo} className="h-20" alt="Logo" />
          <div className="border-l-2 border-gray-200 pl-6">
            <p className="text-white font-bold text-3xl">
              Grade Goal Admin Dashboard
            </p>
            <p className="text-gray-200 text-base">
              System-wide monitoring and analytics
            </p>
          </div>
        </div>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center mr-20 py-2 px-5 bg-[#fffdfd5d] gap-4 rounded shadow-2xl hover:bg-[#ffffff90] transition"
          >
            <div className="text-right">
              <p className="text-black font-bold text-xl">ADMIN</p>
              <p className="text-black text-sm">{currentUser?.displayName || currentUser?.email || 'Admin User'}</p>
            </div>
            <div className="h-12 w-12 rounded-full border-2 border-purple-800 overflow-hidden">
              <img
                src={dummyProfile}
                className="w-full h-full object-cover"
                alt="Admin"
              />
            </div>
          </button>


          {showMenu && (
            <div className="absolute right-0 mt-3 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex ml-25 mt-6">
        <div className="flex bg-[#D4C5F5] rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-5 ml-5 px-5 py-2.5 rounded-md text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? "bg-[#3C2363] text-white"
                  : "bg-[#D4C5F5] text-gray-700 hover:bg-[#bda5e4]"
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center items-center text-gray-500 text-lg">
        {activeTab === "overview" && <Overview />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "ai" && <AIPrediction />}
        {activeTab === "gamification" && <Gamification />}
      </div>
    </div>
  );
}

export default Admin;
import React, { useState, useRef, useEffect } from "react";
import logo from "./assets/logoGG.png";
import dummyProfile from "./assets/dummyProfile.webp";
import { Activity, Users, Brain, Trophy, LogOut } from "lucide-react";
import Overview from "../admin2/tabs/Overview";
import UserManagement from "../admin2/tabs/UserManagement";
import AIPrediction from "../admin2/tabs/AIPrediction";
import Gamification from "../admin2/tabs/Overview"

function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // TODO: connect this with your auth logout function
    console.log("Logging out...");
    alert("You have been logged out.");
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
            <p className="text-black font-bold text-xl">ADMIN</p>
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

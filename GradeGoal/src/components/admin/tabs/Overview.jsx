import React, { useState } from "react";
import { Users, BookOpen, Target, AlertTriangle, Clock, X } from "lucide-react";

const Overview = () => {
  const [showModal, setShowModal] = useState(false);

  const studentsAtRisk = [
    { name: "Sarah Johnson", courses: 4, percent: 68.5, trend: -5.2 },
    { name: "Mike Chen", courses: 5, percent: 71.3, trend: -3.8 },
    { name: "Emily Rodriguez", courses: 3, percent: 69.1, trend: -4.5 },
    { name: "Jason Lee", courses: 6, percent: 65.8, trend: -6.1 },
    { name: "Anna Smith", courses: 4, percent: 67.2, trend: -5.0 },
    { name: "Liam Brown", courses: 5, percent: 70.3, trend: -3.9 },
    { name: "Mia Garcia", courses: 2, percent: 66.4, trend: -4.7 },
  ];

  const activities = [
    { icon: <Users size={16} />, text: "New user registration: john.doe@email.com", time: "3 mins ago" },
    { icon: <BookOpen size={16} />, text: "Added 32 students to 'Data Structures'", time: "12 mins ago" },
    { icon: <Target size={16} />, text: "AI model retrained - Accuracy: 87.4%", time: "1 hour ago" },
    { icon: <Clock size={16} />, text: "Bulk data export completed (CSV format)", time: "2 hours ago" },
  ];

  return (
    
    <div className="p-10 bg-[#D4C5F5] min-h-auto w-11/12 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-[#3C2363]">Overview</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              <p className="font-medium text-gray-600">Total Users</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">12,847</p>
            <p className="text-sm text-gray-500">8,234 active</p>
          </div>
          <span className="text-green-600 font-semibold">+12.5%</span>
        </div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-purple-600" size={20} />
              <p className="font-medium text-gray-600">Active Courses</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">2,890</p>
            <p className="text-sm text-gray-500">3,421 total</p>
          </div>
          <span className="text-green-600 font-semibold">+8.3%</span>
        </div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="text-green-600" size={20} />
              <p className="font-medium text-gray-600">Goals Completed</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">63.0%</p>
            <p className="text-sm text-gray-500">9,847 / 15,632</p>
          </div>
          <span className="text-green-600 font-semibold">+5.7%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students at Risk */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Students at Risk</h2>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {studentsAtRisk.slice(0, 4).map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-orange-50 px-4 py-2 rounded-lg"
              >
                <div>
                  <p className="text-gray-800 font-medium">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.courses} courses</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-600 font-semibold">{s.percent}%</p>
                  <p className="text-xs text-red-500">{s.trend}% trend</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-700">
                <div className="text-blue-600">{a.icon}</div>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{a.text}</p>
                  <p className="text-xs text-gray-500">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

{showModal && (
  <div className="fixed inset-0  backdrop-blur-lg flex justify-center items-center z-50">
    <div className=" bg-white border border-white rounded-xl shadow-2xl w-[90%] max-w-2xl p-6 relative text-white">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 text-black hover:text-gray-500"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-black">
        <AlertTriangle className="text-red-300" size={22} />
        All Students at Risk
      </h2>

      <div className="overflow-y-auto max-h-80">
        {studentsAtRisk.map((s, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-lg mb-2"
          >
            <div>
              <p className="text-black font-medium">{s.name}</p>
              <p className="text-sm text-gray-500">{s.courses} courses</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-600 font-semibold">{s.percent}%</p>
              <p className="text-xs text-red-400">{s.trend}% trend</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowModal(false)}
          className="bg-[#3C2363] text-white px-4 py-2 rounded-lg hover:bg-[#5a3699]"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Overview;

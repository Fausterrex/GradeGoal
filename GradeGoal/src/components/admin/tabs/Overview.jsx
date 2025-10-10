import React, { useState, useEffect } from "react";
import { Users, BookOpen, Target, AlertTriangle, Clock, X } from "lucide-react";

const Overview = () => {
  const [showModal, setShowModal] = useState(false);
  const [overviewData, setOverviewData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    goalsCompleted: 0,
    totalGoals: 0,
    userGrowthRate: 0,
    courseGrowthRate: 0,
    goalGrowthRate: 0
  });
  const [studentsAtRisk, setStudentsAtRisk] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
    fetchStudentsAtRisk();
    fetchRecentActivities();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await fetch('/api/admin/overview');
      if (response.ok) {
        const data = await response.json();
        setOverviewData(data);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const fetchStudentsAtRisk = async () => {
    try {
      const response = await fetch('/api/admin/students-at-risk');
      if (response.ok) {
        const data = await response.json();
        setStudentsAtRisk(data);
      }
    } catch (error) {
      console.error('Error fetching students at risk:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/recent-activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-3xl font-bold mt-2 text-gray-800">
              {loading ? '...' : overviewData.totalUsers.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${overviewData.activeUsers.toLocaleString()} active`}
            </p>
          </div>
          <span className="text-green-600 font-semibold">
            {loading ? '...' : `+${overviewData.userGrowthRate.toFixed(1)}%`}
          </span>
        </div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-purple-600" size={20} />
              <p className="font-medium text-gray-600">Active Courses</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">
              {loading ? '...' : overviewData.activeCourses.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${overviewData.totalCourses.toLocaleString()} total`}
            </p>
          </div>
          <span className="text-green-600 font-semibold">
            {loading ? '...' : `+${overviewData.courseGrowthRate.toFixed(1)}%`}
          </span>
        </div>


        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target className="text-green-600" size={20} />
              <p className="font-medium text-gray-600">Goals Completed</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-gray-800">
              {loading ? '...' : `${((overviewData.goalsCompleted / overviewData.totalGoals) * 100).toFixed(1)}%`}
            </p>
            <p className="text-sm text-gray-500">
              {loading ? '...' : `${overviewData.goalsCompleted.toLocaleString()} / ${overviewData.totalGoals.toLocaleString()}`}
            </p>
          </div>
          <span className="text-green-600 font-semibold">
            {loading ? '...' : `+${overviewData.goalGrowthRate.toFixed(1)}%`}
          </span>
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
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading students at risk...</p>
              </div>
            ) : studentsAtRisk.length > 0 ? (
              studentsAtRisk.slice(0, 4).map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-orange-50 px-4 py-2 rounded-lg"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.courses} courses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-600 font-semibold">{s.percent.toFixed(1)}%</p>
                    <p className="text-xs text-red-500">{s.trend.toFixed(1)}% trend</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No students at risk found.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading recent activities...</p>
              </div>
            ) : activities.length > 0 ? (
              activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700">
                  <div className="text-blue-600">{a.icon}</div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{a.text}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent activities found.</p>
            )}
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
        {studentsAtRisk.length > 0 ? (
          studentsAtRisk.map((s, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-lg mb-2"
            >
              <div>
                <p className="text-black font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">{s.courses} courses</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-600 font-semibold">{s.percent.toFixed(1)}%</p>
                <p className="text-xs text-red-400">{s.trend.toFixed(1)}% trend</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No students at risk found.</p>
        )}
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
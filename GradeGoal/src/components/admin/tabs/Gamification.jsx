import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { auth } from "../../../backend/firebase";

const Gamification = () => {
  const [achievements, setAchievements] = useState([]);
  const [achievementStats, setAchievementStats] = useState({
    totalUnlocked: 0,
    commonPercentage: 0,
    uncommonPercentage: 0,
    rarePercentage: 0,
    epicPercentage: 0,
    legendaryPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievementData();
  }, []);

  // Function to get Firebase authentication headers
  const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  };

  const fetchAchievementData = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/admin/achievements', {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        setAchievementStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8  min-h-auto min-w-11/12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold text-[#3C2363]">Achievement Overview</h1>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#E67E22] font-semibold">🏅 Common</p>
          <p className="text-sm text-gray-500">
            {loading ? '...' : `${achievementStats.commonPercentage.toFixed(1)}% of users earned`}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#1ABC9C] font-semibold">🟢 Uncommon</p>
          <p className="text-sm text-gray-500">
            {loading ? '...' : `${achievementStats.uncommonPercentage.toFixed(1)}% of users earned`}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#E74C3C] font-semibold">🔴 Rare</p>
          <p className="text-sm text-gray-500">
            {loading ? '...' : `${achievementStats.rarePercentage.toFixed(1)}% of users earned`}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#F1C40F] font-semibold">🟡 Epic</p>
          <p className="text-sm text-gray-500">
            {loading ? '...' : `${achievementStats.epicPercentage.toFixed(1)}% of users earned`}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4 text-center">
          <p className="text-[#9B59B6] font-semibold">🟣 Legendary</p>
          <p className="text-sm text-gray-500">
            {loading ? '...' : `${achievementStats.legendaryPercentage.toFixed(1)}% of users earned`}
          </p>
        </div>
      </div>


      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          Achievement Progress Overview
        </h2>

        <div className="space-y-5">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading achievements...</p>
            </div>
          ) : achievements.length > 0 ? (
            achievements.map((a, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>{a.title}</span>
                  <span>
                    {a.progress.toLocaleString()} / {a.total.toLocaleString()} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${a.color} h-3 rounded-full`}
                    style={{
                      width: `${(a.progress / a.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No achievements found.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 text-center">
        <p className="text-sm text-gray-500 mb-1">Achievements</p>
        <p className="text-3xl font-bold text-gray-800">
          {loading ? '...' : achievementStats.totalUnlocked.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">Unlocked</p>
      </div>
    </div>
  );
};

export default Gamification;

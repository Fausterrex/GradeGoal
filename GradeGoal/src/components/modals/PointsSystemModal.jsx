// ========================================
// POINTS SYSTEM MODAL COMPONENT
// ========================================
// Displays comprehensive points system guide with achievement details and checklist

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getAllAchievementsWithProgress } from "../../backend/api";
import { useAuth } from "../context/AuthContext";
function PointsSystemModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("points"); // points, achievements
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch achievements when modal opens
  useEffect(() => {
    if (isOpen && currentUser?.userId && activeTab === "achievements") {
      fetchAchievements();
    }
  }, [isOpen, currentUser?.userId, activeTab]);

  const fetchAchievements = async () => {
    if (!currentUser?.userId) return;
    
    setLoading(true);
    try {
      const response = await getAllAchievementsWithProgress(currentUser.userId);
      setAchievements(response || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 backdrop-blur-lg"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-[10000]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-2xl">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-2xl font-bold">Points & Achievements</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Tabs - Now inside content */}
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("points")}
                className={`px-6 py-3 rounded-lg mr-1 transition-colors font-medium ${
                  activeTab === "points"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                📈 Points System
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`px-6 py-3 rounded-lg transition-colors font-medium ${
                  activeTab === "achievements"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                🏆 Achievements
              </button>
            </div>
          </div>
          
          {activeTab === "points" && (
            <>
              {/* Level System */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📈</span>
              Level System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">How Leveling Works</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Earn points by completing achievements and activities</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Each level requires progressively more points</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Higher levels unlock special rank titles</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Level milestones unlock special achievements</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Level Milestones</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Level 5:</span>
                    <span className="font-mono text-blue-600">2,000 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Level 10:</span>
                    <span className="font-mono text-blue-600">6,250 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Level 20:</span>
                    <span className="font-mono text-blue-600">17,500 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Level 50:</span>
                    <span className="font-mono text-blue-600">61,250 pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Level 100:</span>
                    <span className="font-mono text-purple-600 font-semibold">Ultimate Scholar</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-2">Rank Titles by Level</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 1-4</div>
                  <div className="text-gray-600">Beginner Scholar</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 5-9</div>
                  <div className="text-gray-600">Rising Scholar</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 10-19</div>
                  <div className="text-gray-600">Dedicated Student</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 20-29</div>
                  <div className="text-gray-600">Honor Student</div>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 30-49</div>
                  <div className="text-gray-600">Excellence Scholar</div>
                </div>
                <div className="text-center p-2 bg-indigo-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 50-69</div>
                  <div className="text-gray-600">GradeGoal Expert</div>
                </div>
                <div className="text-center p-2 bg-pink-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 70-89</div>
                  <div className="text-gray-600">Academic Legend</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <div className="font-semibold text-gray-700">Levels 90-100</div>
                  <div className="text-gray-600">Ultimate Scholar</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Points */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              Achievement Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Common Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-400">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">🏆</span>
                  <h4 className="font-semibold text-gray-800">COMMON</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">5-20 points</span>
                </div>
                <div className="text-xs text-gray-500">
                  Basic achievements like first login, profile setup, etc.
                </div>
              </div>

              {/* Uncommon Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-400">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">🔸</span>
                  <h4 className="font-semibold text-gray-800">UNCOMMON</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">20-30 points</span>
                </div>
                <div className="text-xs text-gray-500">
                  Regular achievements like weekly streaks, grade improvements.
                </div>
              </div>

              {/* Rare Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-400">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">⭐</span>
                  <h4 className="font-semibold text-gray-800">RARE</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">35-55 points</span>
                </div>
                <div className="text-xs text-gray-500">
                  Significant achievements like monthly streaks, high grades.
                </div>
              </div>

              {/* Epic Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-400">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">💎</span>
                  <h4 className="font-semibold text-gray-800">EPIC</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">65-80 points</span>
                </div>
                <div className="text-xs text-gray-500">
                  Major achievements like semester goals, long streaks.
                </div>
              </div>

              {/* Legendary Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-400">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">👑</span>
                  <h4 className="font-semibold text-gray-800">LEGENDARY</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">90-150 points</span>
                </div>
                <div className="text-xs text-gray-500">
                  Ultimate achievements like perfect GPA, year-long streaks.
                </div>
              </div>

              {/* Level Achievements */}
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-400">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">🎯</span>
                  <h4 className="font-semibold text-gray-800">LEVEL</h4>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">5-100 points</span>
                </div>
                <div className="text-xs text-gray-500">
                  Special level milestones (every 5 levels up to 100).
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Categories */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">📚</span>
              Achievement Categories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">📖 ACADEMIC</h4>
                <div className="text-xs text-gray-600">
                  Grade achievements, GPA milestones, perfect scores, academic excellence
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">🎯 GOAL</h4>
                <div className="text-xs text-gray-600">
                  Setting and achieving academic goals, goal streaks, planning
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">📅 CONSISTENCY</h4>
                <div className="text-xs text-gray-600">
                  Login streaks, regular usage, long-term engagement
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">📈 IMPROVEMENT</h4>
                <div className="text-xs text-gray-600">
                  Grade improvements, GPA increases, comeback stories
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">👥 SOCIAL</h4>
                <div className="text-xs text-gray-600">
                  Sharing progress, helping others, community engagement
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-2">🏅 SPECIAL</h4>
                <div className="text-xs text-gray-600">
                  Milestone achievements, special accomplishments, rare feats
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Titles */}
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎖️</span>
              Achievement Titles You Can Earn
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Academic Excellence Titles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">🏆</span>
                    <div>
                      <div className="font-semibold">Perfect Scholar</div>
                      <div className="text-xs text-gray-600">Achieve a perfect 4.0 semester GPA</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">🎓</span>
                    <div>
                      <div className="font-semibold">Dean's List</div>
                      <div className="text-xs text-gray-600">Achieve semester GPA of 3.5 or higher</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">⭐</span>
                    <div>
                      <div className="font-semibold">Honor Roll</div>
                      <div className="text-xs text-gray-600">Maintain high grades across all courses</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-500 mr-2">💫</span>
                    <div>
                      <div className="font-semibold">Grade Master</div>
                      <div className="text-xs text-gray-600">Consistent academic performance</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Progress & Consistency Titles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-2">🔥</span>
                    <div>
                      <div className="font-semibold">Streak Master</div>
                      <div className="text-xs text-gray-600">Maintain login streaks of 7, 30, 100 days</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-pink-500 mr-2">📈</span>
                    <div>
                      <div className="font-semibold">Rising Star</div>
                      <div className="text-xs text-gray-600">Show consistent grade improvement</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-teal-500 mr-2">🎯</span>
                    <div>
                      <div className="font-semibold">Goal Crusher</div>
                      <div className="text-xs text-gray-600">Achieve multiple academic goals</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-500 mr-2">💪</span>
                    <div>
                      <div className="font-semibold">Comeback Champion</div>
                      <div className="text-xs text-gray-600">Improve from failing to passing grades</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3">Milestone Titles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2">🏅</span>
                    <div>
                      <div className="font-semibold">Century Club</div>
                      <div className="text-xs text-gray-600">Reach Level 100</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2">👑</span>
                    <div>
                      <div className="font-semibold">Ultimate Scholar</div>
                      <div className="text-xs text-gray-600">Maximum level achievement</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2">🌟</span>
                    <div>
                      <div className="font-semibold">Early Adopter</div>
                      <div className="text-xs text-gray-600">Join GradeGoal community early</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2">🎊</span>
                    <div>
                      <div className="font-semibold">Year Veteran</div>
                      <div className="text-xs text-gray-600">Active for one full academic year</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Tips for Earning Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Log in daily to maintain streaks</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Enter grades regularly for academic achievements</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Set and achieve academic goals</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Focus on improving your grades</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Complete courses with high averages</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Sync assignments to calendar</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Export academic reports</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm text-gray-700">Stay consistent over time</span>
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-6">
              {/* Achievements Header */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🏆 Achievement Checklist</h3>
                <p className="text-gray-600">Track your progress and see what achievements you can unlock next!</p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading achievements...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {achievements.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No achievements data available.</p>
                    </div>
                  ) : (
                    <>
                      {/* Achievement Categories */}
                      {["ACADEMIC", "CONSISTENCY", "IMPROVEMENT", "GOAL", "SOCIAL"].map(category => {
                        const categoryAchievements = achievements.filter(a => a.category === category);
                        if (categoryAchievements.length === 0) return null;

                        const completedCount = categoryAchievements.filter(a => a.unlocked).length;
                        const totalCount = categoryAchievements.length;

                        return (
                          <div key={category} className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                <span className="mr-2">
                                  {category === "ACADEMIC" && "📚"}
                                  {category === "CONSISTENCY" && "⏰"}
                                  {category === "IMPROVEMENT" && "📈"}
                                  {category === "GOAL" && "🎯"}
                                  {category === "SOCIAL" && "👥"}
                                </span>
                                {category.charAt(0) + category.slice(1).toLowerCase()} Achievements
                              </h4>
                              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                {completedCount}/{totalCount} completed
                              </div>
                            </div>

                            <div className="space-y-3">
                              {categoryAchievements.map(achievement => (
                                <div 
                                  key={achievement.achievementId} 
                                  className={`flex items-start p-4 rounded-lg border-2 transition-all ${
                                    achievement.unlocked 
                                      ? "bg-green-50 border-green-200" 
                                      : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <div className="flex-shrink-0 mr-3 mt-1">
                                    {achievement.unlocked ? (
                                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className={`font-semibold ${
                                        achievement.unlocked ? "text-green-800" : "text-gray-800"
                                      }`}>
                                        {achievement.name}
                                      </h5>
                                      <div className="flex items-center space-x-2">
                                        <span className={`text-sm px-2 py-1 rounded-full ${
                                          achievement.rarity === "LEGENDARY" ? "bg-yellow-100 text-yellow-800" :
                                          achievement.rarity === "EPIC" ? "bg-purple-100 text-purple-800" :
                                          achievement.rarity === "RARE" ? "bg-blue-100 text-blue-800" :
                                          achievement.rarity === "UNCOMMON" ? "bg-green-100 text-green-800" :
                                          "bg-gray-100 text-gray-800"
                                        }`}>
                                          {achievement.rarity}
                                        </span>
                                        <span className="text-sm font-medium text-gray-600">
                                          +{achievement.points} pts
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <p className={`text-sm mb-2 ${
                                      achievement.unlocked ? "text-green-700" : "text-gray-600"
                                    }`}>
                                      {achievement.description}
                                    </p>

                                    {achievement.unlocked && achievement.earnedAt && (
                                      <p className="text-xs text-green-600">
                                        ✓ Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                                      </p>
                                    )}

                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PointsSystemModal;

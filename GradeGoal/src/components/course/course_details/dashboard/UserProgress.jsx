// ========================================
// USER PROGRESS COMPONENT
// ========================================
// Displays user progress, level, points, and achievements

import React, { useState, useEffect } from "react";
import { getUserProgressWithRank, getRecentAchievements, getUserLoginStreak } from "../../../../backend/api";
import PointsSystemModal from "../../../common/PointsSystemModal";

function UserProgress({ userProgress, course, userId }) {
  const [progressData, setProgressData] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPointsModal, setShowPointsModal] = useState(false);

  useEffect(() => {
    const fetchProgressWithRank = async () => {
      if (userId) {
        try {
          setIsLoading(true);
          const [progressResponse, achievementsResponse] = await Promise.all([
            getUserProgressWithRank(userId),
            getRecentAchievements(userId)
          ]);
          
          // Try to get streak data separately to avoid failing the entire request
          let streakResponse = null;
          try {
            streakResponse = await getUserLoginStreak(userId);
          } catch (streakError) {
            console.warn('⚠️ [UserProgress] Failed to fetch streak data:', streakError.message);
            // Continue without streak data
          }
          
          console.log('🎯 [UserProgress] Fetched data:', {
            progressResponse,
            achievementsResponse,
            streakResponse
          });
          setProgressData(progressResponse);
          setRecentAchievements(achievementsResponse);
          setStreakData(streakResponse);
        } catch (error) {
          console.error("Error fetching user progress with rank:", error);
          // Fallback to passed userProgress
          setProgressData({ userProgress, rankTitle: "Beginner Scholar" });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Fallback to passed userProgress
        setProgressData({ userProgress, rankTitle: "Beginner Scholar" });
        setIsLoading(false);
      }
    };

    fetchProgressWithRank();
  }, [userId, userProgress]);

  if (isLoading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Progress</h3>
        <div className="text-center py-8">
          <span className="text-4xl text-gray-300">🎯</span>
          <p className="text-gray-500 mt-2">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!progressData?.userProgress) {
    return (
      <div className="bg-white rounded border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Progress</h3>
        <div className="text-center py-8">
          <span className="text-4xl text-gray-300">🎯</span>
          <p className="text-gray-500 mt-2">No progress data available</p>
        </div>
      </div>
    );
  }

  const currentProgress = progressData.userProgress;
  const rankTitle = progressData.rankTitle || "Beginner Scholar";
  const pointsRequiredForNextLevel = progressData.pointsRequiredForNextLevel || 100;
  const pointsRequiredForCurrentLevel = progressData.pointsRequiredForCurrentLevel || 0;

  // Calculate progress within current level
  const currentLevel = currentProgress.currentLevel || 1;
  const totalPoints = currentProgress.totalPoints || 0;
  
  // Calculate points needed for next level (simplified logic)
  const pointsNeededForNextLevel = Math.max(0, pointsRequiredForNextLevel - totalPoints);
  
  // Calculate progress percentage towards next level
  const pointsInCurrentLevel = Math.max(0, totalPoints - pointsRequiredForCurrentLevel);
  const pointsNeededForCurrentLevel = pointsRequiredForNextLevel - pointsRequiredForCurrentLevel;
  const progressPercentage = pointsNeededForCurrentLevel > 0 ? Math.min((pointsInCurrentLevel / pointsNeededForCurrentLevel) * 100, 100) : 0;

  // Set level_info with dynamic rank
  const level_info = {
    level: currentLevel,
    levelName: rankTitle,
    totalPoints: totalPoints,
    pointsToNextLevel: pointsNeededForNextLevel,
    isMaxLevel: currentLevel >= 100
  };
  


  const getSemesterMessage = (gpa) => {
    if (gpa < 1) return "Try Harder!";
    if (gpa < 2) return "Keep Studying!";
    if (gpa < 3) return "Doing Good!";
    return "Great Work!";
  };

  const getGpaMessage = (gpa) => {
    if (gpa < 1) return "Try Harder!";
    if (gpa < 2) return "Keep Studying!";
    if (gpa < 3) return "Doing Good!";
    return "Great Work!";
  };

  return (
    <div className="space-y-6 ">
      {/* Main Progress Card */}
      <div className="bg-white rounded-xl border border-gray-300 p-6 shadow ">
        <div className="flex items-center justify-between mb-4 ">
          <h3 className="text-xl font-semibold text-gray-900">Your Progress</h3>
          <div className="text-m text-gray-600">Level {level_info.level}</div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">{level_info.levelName}</span>
            <span className="text-sm font-bold text-gray-900">
              {totalPoints || 0} pts
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {!level_info.isMaxLevel && (
            <div className="text-xs text-gray-500 mt-1">
              {pointsNeededForNextLevel} points to next level
            </div>
          )}
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="group [perspective:1000px] w-28 h-28 mx-auto">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-full border border-gray-300 shadow-xl text-center [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">{level_info.level}</div>
                <div className="text-xs font-semibold text-gray-600">Level</div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-200 rounded-full border border-gray-300 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">⭐</div>
                <div className="text-xs text-gray-700">Keep Going!</div>
              </div>
            </div>
          </div>

          <div className="group [perspective:1000px] w-28 h-28 mx-auto">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-full border border-gray-300 shadow-xl text-center [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">
                  {(() => {
                    const streakDays = streakData?.streakDays || currentProgress.streakDays || 0;
                    console.log('🔥 [UserProgress] Streak display:', { 
                      streakData, 
                      currentProgressStreak: currentProgress.streakDays, 
                      finalStreakDays: streakDays,
                      hasStreakData: !!streakData,
                      hasCurrentProgressStreak: currentProgress.streakDays !== undefined
                    });
                    return streakDays;
                  })()}
                </div>
                <div className="text-xs font-semibold  text-gray-600">Day Streak</div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-200 rounded-full border border-gray-300 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">🔥</div>
                <div className="text-xs text-gray-700">
                  {streakData?.isStreakActive ? "Keep Going!" : "Start Streak!"}
                </div>
              </div>
            </div>
          </div>
          <div className="group [perspective:1000px] w-28 h-28 mx-auto">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-full border border-gray-300 shadow-xl text-center [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">{(currentProgress.semesterGpa || 0).toFixed(2)}</div>
                <div className="text-xs font-semibold text-gray-600">Semester GPA</div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-200 rounded-full border border-gray-300 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">📘</div>
                <div className="text-xs text-gray-700">
                  {getSemesterMessage(currentProgress.semesterGpa || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="group [perspective:1000px] w-28 h-28 mx-auto">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* Front */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-full border border-gray-300 shadow-xl text-center [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">{(currentProgress.cumulativeGpa || 0).toFixed(2)}</div>
                <div className="text-xs font-semibold text-gray-600">Cumulative GPA</div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-200 rounded-full border border-gray-300 shadow-xl text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div className="text-xl font-bold text-gray-900">🏆</div>
                <div className="text-xs text-gray-700">
                  {getGpaMessage(currentProgress.cumulativeGpa || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Points System Button */}
        <div className="text-center mb-5">
          <button
            onClick={() => setShowPointsModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            View Points System
          </button>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl border border-gray-300 p-6 shadow mb-5">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h4>
          <div className="space-y-3">
            {/* Display recent achievements from database */}
            {recentAchievements.length > 0 ? (
              recentAchievements.map((achievement, index) => (
                <div key={achievement.userAchievementId} className={`flex items-center gap-3 p-3 rounded border ${
                  achievement.rarity === 'LEGENDARY' ? 'bg-yellow-50 border-yellow-200' :
                  achievement.rarity === 'EPIC' ? 'bg-purple-50 border-purple-200' :
                  achievement.rarity === 'RARE' ? 'bg-blue-50 border-blue-200' :
                  achievement.rarity === 'UNCOMMON' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <span className="text-2xl">
                    {achievement.rarity === 'LEGENDARY' ? '👑' :
                     achievement.rarity === 'EPIC' ? '💎' :
                     achievement.rarity === 'RARE' ? '⭐' :
                     achievement.rarity === 'UNCOMMON' ? '🔸' :
                     '🏆'}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{achievement.name}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                        achievement.rarity === 'LEGENDARY' ? 'bg-yellow-500' :
                        achievement.rarity === 'EPIC' ? 'bg-purple-500' :
                        achievement.rarity === 'RARE' ? 'bg-blue-500' :
                        achievement.rarity === 'UNCOMMON' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}>
                        {achievement.rarity}
                      </span>
                      <span className="text-xs text-[#8168C5] font-semibold">
                        +{achievement.points} points
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <span className="text-2xl">🎯</span>
                <p className="mt-2">Keep going to unlock achievements!</p>
              </div>
            )}
          </div>
        </div>

        {/* Next Milestone */}
        {!level_info.isMaxLevel && (
          <div className="bg-white rounded-xl border border-gray-300 p-6 shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Next Milestone</h4>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                Level {level_info.level + 1}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {pointsNeededForNextLevel} points needed
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Points System Modal */}
      <PointsSystemModal 
        isOpen={showPointsModal} 
        onClose={() => setShowPointsModal(false)} 
      />
    </div>
  );
}

export default UserProgress;

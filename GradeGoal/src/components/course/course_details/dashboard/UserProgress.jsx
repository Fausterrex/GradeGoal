// ========================================
// USER PROGRESS COMPONENT
// ========================================
// Displays user progress, level, points, and achievements

import React from "react";

function UserProgress({ userProgress, course }) {
  if (!userProgress) {
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

  const { level_info } = userProgress;
  const progressPercentage = level_info.isMaxLevel
    ? 100
    : ((level_info.totalPoints - (level_info.totalPoints - level_info.pointsToNextLevel)) / (level_info.totalPoints + level_info.pointsToNextLevel)) * 100;

  return (
    <div className="space-y-6 ">
      {/* Main Progress Card */}
      <div className="bg-white rounded-xl border border-gray-300 p-6 shadow ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
          <div className="text-sm text-gray-600">Level {level_info.level}</div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">{level_info.levelName}</span>
            <span className="text-sm font-bold text-gray-900">
              {level_info.totalPoints} pts
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
              {level_info.pointsToNextLevel} points to next level
            </div>
          )}
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-50 rounded-full border text-center mx-auto">
            <div className="text-xl font-bold text-gray-900">{level_info.level}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-50 rounded-full border text-center mx-auto">
            <div className="text-xl font-bold text-gray-900">{userProgress.streak_days}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-50 rounded-full border text-center mx-auto">
            <div className="text-xl font-bold text-gray-900">{userProgress.semester_gpa?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-gray-600">Semester GPA</div>
          </div>
          <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-50 rounded-full border text-center mx-auto">
            <div className="text-xl font-bold text-gray-900">{userProgress.cumulative_gpa?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-gray-600">Cumulative GPA</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl border border-gray-300 p-6 shadow">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h4>
        <div className="space-y-3">
          {/* Level Achievement */}
          {level_info.level >= 5 && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="font-medium text-gray-900">Rising Star</div>
                <div className="text-sm text-gray-600">Reached level {level_info.level}</div>
              </div>
            </div>
          )}

          {/* Streak Achievement */}
          {userProgress.streak_days >= 7 && (
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded border border-orange-200">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-medium text-gray-900">Week Warrior</div>
                <div className="text-sm text-gray-600">{userProgress.streak_days} day streak</div>
              </div>
            </div>
          )}

          {/* GPA Achievement */}
          {userProgress.semester_gpa >= 3.5 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-200">
              <span className="text-2xl">🎓</span>
              <div>
                <div className="font-medium text-gray-900">Honor Roll</div>
                <div className="text-sm text-gray-600">{userProgress.semester_gpa.toFixed(2)} GPA</div>
              </div>
            </div>
          )}

          {/* Default message if no achievements */}
          {level_info.level < 5 && userProgress.streak_days < 7 && userProgress.semester_gpa < 3.5 && (
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
              {level_info.pointsToNextLevel} points needed
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(level_info.totalPoints / (level_info.totalPoints + level_info.pointsToNextLevel)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProgress;

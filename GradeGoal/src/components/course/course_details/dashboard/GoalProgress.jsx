// ========================================
// GOAL PROGRESS COMPONENT
// ========================================
// Simple and clean goal progress display

import React from "react";
import { convertPercentageToGPA } from "../../../../utils/gradeCalculations";

function GoalProgress({
  currentGrade,
  targetGrade,
  course,
  colorScheme,
  onSetGoal = () => { } // Callback for when user wants to set a goal
}) {
  // If no target grade is set, show a prompt to set a goal
  if (!targetGrade) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden p-6">
        <div className={`bg-gradient-to-r ${colorScheme.gradient} px-6 py-4 -mx-6 -mt-6 mb-6`}>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Goal Progress
          </h3>
        </div>

        <div className="text-center py-8">
          <div className="text-6xl mb-4 text-gray-300">🎯</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No Goal Set
          </h3>
          <p className="text-gray-500 mb-6">
            Set a target GPA to track your progress and stay motivated
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSetGoal();
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
            type="button"
          >
            🎯 Set Goal
          </button>
          <p className="text-xs text-gray-400 mt-3">
            Click to navigate to goal setting page
          </p>
        </div>

        {/* Current Grade Display */}
        {currentGrade && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Current Grade</div>
              <div className="text-2xl font-bold text-gray-900">
                {currentGrade.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentGPA = convertPercentageToGPA(currentGrade, course.gpaScale || "4.0");
  const targetGPA = parseFloat(targetGrade);
  const progressPercentage = targetGPA && currentGPA
    ? Math.min((currentGPA / targetGPA) * 100, 100)
    : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "bg-green-500";
    if (progressPercentage >= 70) return "bg-yellow-500";
    if (progressPercentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    if (progressPercentage >= 90) return "Excellent";
    if (progressPercentage >= 70) return "Good";
    if (progressPercentage >= 50) return "Needs Work";
    return "Below Target";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 w-full mx-auto flex flex-col items-center">
      <h3 className="text-2xl font-semibold text-gray-900 mb-4">
        Goal Progress
      </h3>
      {/* Progress Circle */}
      <div className="relative w-45 h-45 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="90"
            cy="90"
            r="70"
            stroke="#E5E7EB"
            strokeWidth="20"
            fill="none"
          />
          <circle
            cx="90"
            cy="90"
            r="70"
            stroke={
              progressPercentage < 25
                ? "#EF4444" 
                : progressPercentage < 50
                  ? "#F97316" 
                  : progressPercentage < 80
                    ? "#3B82F6" 
                    : "#22C55E" 
            }
            strokeWidth="20"
            fill="none"
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={
              2 * Math.PI * 70 - (progressPercentage / 100) * 2 * Math.PI * 70
            }
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {progressPercentage.toFixed(0)}%
          </span>
          <span className="text-sm text-gray-500">Progress</span>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-m font-medium ${progressPercentage >= 90 ? "bg-green-100 text-green-800" :
            progressPercentage >= 70 ? "bg-yellow-100 text-yellow-800" :
              progressPercentage >= 50 ? "bg-orange-100 text-orange-800" :
                "bg-red-100 text-red-800"
            }`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex justify-between w-full">
        <div className="flex-1 text-center bg-gray-50 rounded-3xl border border-gray-300 p-3 mx-1 shadow-xl">
          <div className="text-2xl font-bold text-gray-900">
            {currentGPA.toFixed(2)}
          </div>
          <div className="text-gray-600 text-sm">Current GPA</div>
        </div>
        <div className="flex-1 text-center bg-gray-50 rounded-3xl border border-gray-300 p-3 mx-1 shadow-xl">
          <div className="text-2xl font-bold text-blue-600">
            {targetGPA.toFixed(2)}
          </div>
          <div className="text-gray-600 text-sm">Target GPA</div>
        </div>
      </div>


      {/* Gap Analysis */}
      {currentGPA < targetGPA && (
        <div className="w-[98%] h-[13%] mt-7 p-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg border border-blue-200 flex justify-center items-center ">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              Need {(targetGPA - currentGPA).toFixed(2)} more points to reach your target GPA
            </div>

          </div>
        </div>
      )}

      {currentGPA >= targetGPA && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-center">
            <div className="text-sm font-semibold text-green-700 mb-1">
              🎉 Goal Achieved!
            </div>
            <div className="text-xs text-green-600">
              You've reached your target GPA
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalProgress;

// ========================================
// GOAL PROGRESS INDICATOR COMPONENT
// ========================================
// Visual progress indicator showing progress toward course goal

import React from "react";
import { convertPercentageToGPA } from "../../../utils/gradeCalculations";

function GoalProgressIndicator({ 
  currentGrade, 
  targetGrade, 
  course, 
  colorScheme 
}) {
  const currentGPA = convertPercentageToGPA(
    currentGrade, 
    course.gpaScale || "4.0"
  );
  const targetGPA = targetGrade ? parseFloat(targetGrade) : null;
  
  const progressPercentage = targetGPA && currentGPA 
    ? Math.min((currentGPA / targetGPA) * 100, 100)
    : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "from-green-500 to-emerald-500";
    if (progressPercentage >= 70) return "from-yellow-500 to-orange-500";
    if (progressPercentage >= 50) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  const getProgressStatus = () => {
    if (progressPercentage >= 90) return "Excellent Progress";
    if (progressPercentage >= 70) return "Good Progress";
    if (progressPercentage >= 50) return "Needs Improvement";
    return "Below Target";
  };

  const getStatusIcon = () => {
    if (progressPercentage >= 90) {
      return <span className="text-green-600 text-xl">✅</span>;
    } else if (progressPercentage >= 70) {
      return <span className="text-yellow-600 text-xl">⚠️</span>;
    } else {
      return <span className="text-red-600 text-xl">⚠️</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorScheme.gradient} px-6 py-4`}>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl">📈</span>
          Goal Progress
        </h3>
      </div>

      {/* Content */}
      <div className="p-6">
        {targetGPA ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Progress to Goal</span>
                <span className="text-sm font-bold text-gray-900">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-out`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Current vs Target */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">
                  {currentGPA.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Current GPA</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-900">
                  {targetGPA.toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">Target GPA</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl">
              {getStatusIcon()}
              <span className="text-lg font-semibold text-gray-900">
                {getProgressStatus()}
              </span>
            </div>

            {/* Gap Analysis */}
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="text-lg font-semibold text-gray-900 mb-1">
                {currentGPA >= targetGPA ? (
                  <span className="text-green-600">Goal Achieved! 🎉</span>
                ) : (
                  <span className="text-gray-700">
                    Need {(targetGPA - currentGPA).toFixed(2)} more points
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                to reach your target GPA
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 text-gray-300">📈</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Goal Set
            </h3>
            <p className="text-gray-500 mb-4">
              Set a target GPA to track your progress
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Set Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalProgressIndicator;

// ========================================
// GOAL PROGRESS COMPONENT
// ========================================
// Simple and clean goal progress display

import React from "react";
import { convertToGPA, calculateAchievementProbability } from "../../academic_goal/gpaConversionUtils";

function GoalProgress({
  currentGrade,
  targetGrade,
  course,
  colorScheme,
  grades = {},
  categories = [],
  onSetGoal = () => {} // Callback for when user wants to set a goal
}) {
  // Calculate course completion progress
  const calculateCourseCompletion = () => {
    if (!categories || categories.length === 0) return 0;
    
    let totalAssessments = 0;
    let completedAssessments = 0;
    
    categories.forEach(category => {
      const categoryGrades = grades[category.id] || [];
      totalAssessments += Math.max(categoryGrades.length, 1); // Each category should have at least 1 assessment
      categoryGrades.forEach(grade => {
        if (grade.score !== null && grade.score !== undefined) {
          completedAssessments++;
        }
      });
    });
    
    return totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
  };
  
  const courseCompletion = calculateCourseCompletion();
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

  // Work with GPA values (current grade should now be GPA from course_gpa column)
  const currentGPA = typeof currentGrade === 'number' ? currentGrade : 0;
  
  // Convert target value to GPA using utility function
  const targetGPA = convertToGPA(targetGrade, course?.gpaScale === '5.0' ? 5.0 : 4.0);
  
  // Calculate course completion progress for achievement probability
  let courseProgress = 0;
  if (categories.length > 0) {
    let totalAssessments = 0;
    let completedAssessments = 0;
    
    categories.forEach(category => {
      const categoryGrades = grades[category.id] || [];
      totalAssessments += Math.max(categoryGrades.length, 1); // Each category should have at least 1 assessment
      categoryGrades.forEach(grade => {
        if (grade.score !== null && grade.score !== undefined) {
          completedAssessments++;
        }
      });
    });
    
    courseProgress = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
  }
  
  // Calculate progress percentage based on GPA values
  let progressPercentage = 0;
  if (targetGPA > 0) {
    progressPercentage = Math.min((currentGPA / targetGPA) * 100, 100);
  }
  
  // Calculate achievement probability using utility function
  let achievementProbability = calculateAchievementProbability(
    currentGPA, 
    targetGPA, 
    courseCompletion, 
    null // targetDate - can be added later if needed
  );
  
  // If course is completed but goal not achieved, set probability to 0
  if (courseCompletion >= 100 && currentGPA < targetGPA) {
    achievementProbability = 0;
  }

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "bg-green-500";
    if (progressPercentage >= 70) return "bg-yellow-500";
    if (progressPercentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    // Check if course is completed (100% progress)
    const isCourseCompleted = courseCompletion >= 100;
    
    if (currentGPA >= targetGPA) {
      return "Goal Achieved! 🎉";
    } else if (isCourseCompleted) {
      // Course is completed but goal not reached
      const gap = (targetGPA - currentGPA).toFixed(2);
      return `Course Complete - ${gap} GPA short`;
    } else if (progressPercentage >= 90) {
      return "Almost There!";
    } else if (progressPercentage >= 70) {
      return "Good Progress";
    } else if (progressPercentage >= 50) {
      return "Making Progress";
    } else {
      return "Needs Improvement";
    }
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
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          currentGPA >= targetGPA ? "bg-green-100 text-green-800" :
          courseCompletion >= 100 ? "bg-purple-100 text-purple-800" : // Special color for completed but not achieved
          progressPercentage >= 90 ? "bg-green-100 text-green-800" :
          progressPercentage >= 70 ? "bg-yellow-100 text-yellow-800" :
          progressPercentage >= 50 ? "bg-orange-100 text-orange-800" :
          "bg-red-100 text-red-800"
        }`}>
          {getStatusText()}
        </span>
      </div>

      {/* Achievement Probability */}
      <div className="mt-3 text-center">
        <div className="text-xs text-gray-500 mb-1">Achievement Probability</div>
        <div className={`text-lg font-bold ${
          achievementProbability >= 80 ? "text-green-600" :
          achievementProbability >= 60 ? "text-yellow-600" :
          achievementProbability >= 40 ? "text-orange-600" :
          "text-red-600"
        }`}>
          {achievementProbability}%
        </div>
        <div className="text-xs text-gray-400">
          Based on current progress ({Math.round(courseProgress)}% complete)
        </div>
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
      {currentGPA < targetGPA && courseCompletion < 100 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-300 to-indigo-200 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700 mb-1">
              Need {(targetGPA - currentGPA).toFixed(2)} more GPA points
            </div>
            <div className="text-xs text-gray-600">
              to reach your target GPA
            </div>

          </div>
        </div>
      )}
      
      {/* Special message for completed courses that didn't reach goal */}
      {currentGPA < targetGPA && courseCompletion >= 100 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg border border-purple-300">
          <div className="text-center">
            <div className="text-sm font-semibold text-purple-800 mb-2">
              📚 Course Completed
            </div>
            <div className="text-xs text-purple-700 mb-2">
              You finished strong with a {currentGPA.toFixed(2)} GPA!
            </div>
            <div className="text-xs text-purple-600">
              Just {(targetGPA - currentGPA).toFixed(2)} GPA points away from your target of {targetGPA.toFixed(2)}
            </div>
            <div className="mt-2 text-xs text-purple-500">
              💪 Great effort! Every completed course builds your academic journey.
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

// ========================================
// GOAL CARD COMPONENT
// ========================================
// This component displays individual goal cards with progress information

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaEdit, FaTimes, FaBullseye, FaCalendarAlt } from "react-icons/fa";
import { calculateGoalProgress, getProgressStatusInfo, getProgressBarColor } from "./goalProgress";
import { getGoalTypeLabel, getPriorityColor, getCourseName, formatGoalDate } from "./goalUtils";

const GoalCard = ({ 
  goal, 
  courses, 
  grades, 
  onEdit, 
  onDelete, 
  isCompact = false,
  allGoals = []
}) => {
  const [progressData, setProgressData] = useState({
    progress: 0,
    currentValue: 0,
    targetValue: 0,
    isAchieved: false,
    isOnTrack: false,
    achievementProbability: 0,
    remainingValue: 0,
    progressPercentage: 0,
    status: 'not_started',
    isCourseCompleted: false,
    courseCompletionStatus: 'ongoing'
  });

  // Memoize the goal progress calculation to prevent infinite loops
  const memoizedGoalProgress = useMemo(() => {
    if (!goal) return Promise.resolve({
      progress: 0,
      currentValue: 0,
      targetValue: 0,
      isAchieved: false,
      isOnTrack: false,
      achievementProbability: 0,
      remainingValue: 0,
      progressPercentage: 0,
      status: 'not_started',
      isCourseCompleted: false,
      courseCompletionStatus: 'ongoing'
    });
    
    return calculateGoalProgress(goal, courses, grades, {}, allGoals);
  }, [
    goal?.goalId, 
    goal?.targetValue, 
    goal?.goalType, 
    goal?.courseId, 
    goal?.semester, 
    goal?.academicYear,
    // Only depend on course IDs and grade keys, not the full objects
    courses.map(c => c.id || c.courseId).join(','),
    Object.keys(grades).join(','),
    allGoals.length
  ]);

  // Calculate goal progress asynchronously with proper caching
  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      try {
        const data = await memoizedGoalProgress;
        if (isMounted) {
          setProgressData(data);
        }
      } catch (error) {
        console.error('Error calculating goal progress:', error);
      }
    };

    loadProgress();
    
    return () => {
      isMounted = false;
    };
  }, [memoizedGoalProgress]);

  const statusInfo = getProgressStatusInfo(progressData.status);
  const progressBarColor = getProgressBarColor(progressData.status, progressData.progress);


 return (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {goal.goalTitle}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
              goal.priority
            )}`}
          >
            {goal.priority}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <FaBullseye className="w-3 h-3" />
            <span>Target: {progressData.targetValue}%</span>
          </div>
          {goal.courseId && (
            <span className="text-gray-400">• {getCourseName(goal.courseId, courses)}</span>
          )}
          {goal.goalType === "SEMESTER_GPA" &&
            goal.semester &&
            goal.academicYear && (
              <span className="text-gray-400">
                •{" "}
                {goal.semester === "FIRST"
                  ? "1st"
                  : goal.semester === "SECOND"
                  ? "2nd"
                  : "3rd"}{" "}
                Sem {goal.academicYear}
              </span>
            )}
          <div className="flex items-center space-x-1">
            <FaCalendarAlt className="w-3 h-3" />
            <span>{formatGoalDate(goal.targetDate)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(goal)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(goal)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="flex items-center space-x-3 mb-4">
      <span className="text-sm font-medium text-gray-600">
        {progressData.isCourseCompleted ? "Course Progress:" : "Progress:"}
      </span>
      <div className="flex-1 bg-red-100 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-red-400 transition-all duration-300"
          style={{ width: `${progressData.progress}%` }}
        ></div>
      </div>
      <span className="text-sm font-semibold text-gray-800">
        {progressData.progress}%
      </span>
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
      >
        {statusInfo.text}
      </span>
    </div>

    {/* Current vs Target */}
    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
      <div>
        Current:{" "}
        <span className="font-semibold text-gray-800">
          {progressData.currentValue}%
        </span>
      </div>
      <div>
        Target:{" "}
        <span className="font-semibold text-gray-800">
          {progressData.targetValue}%
        </span>
      </div>
    </div>

    {/* Motivational Message */}
    {!progressData.isCourseCompleted && (
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 mb-4">
        <span className="text-sm text-gray-700">
          🚀 You’ve got this! Every journey starts with a single step!
        </span>
      </div>
    )}

    {/* Achievement Probability */}
    {!progressData.isCourseCompleted && !isCompact && (
      <div className="flex items-center space-x-2 text-sm mb-4">
        <span className="text-gray-600">Achievement Probability:</span>
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              progressData.achievementProbability >= 70
                ? "bg-green-500"
                : progressData.achievementProbability >= 40
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${progressData.achievementProbability}%` }}
          ></div>
        </div>
        <span
          className={`font-semibold ${
            progressData.achievementProbability >= 70
              ? "text-green-600"
              : progressData.achievementProbability >= 40
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {progressData.achievementProbability}%
        </span>
      </div>
    )}

    {/* Remaining */}
    {!progressData.isCourseCompleted && progressData.remainingValue > 0 && (
      <div className="text-sm text-gray-600">
        <span className="font-medium">Remaining:</span>{" "}
        {progressData.remainingValue}% to reach target
      </div>
    )}
  </div>
);
}

export default GoalCard;

// ========================================
// GOAL CARD COMPONENT
// ========================================
// This component displays individual goal cards with progress information

import React from "react";
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
  // Calculate goal progress
  const progressData = calculateGoalProgress(goal, courses, grades, {}, allGoals);
  const statusInfo = getProgressStatusInfo(progressData.status);
  const progressBarColor = getProgressBarColor(progressData.status, progressData.progress);


  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {goal.goalTitle}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
              {goal.priority}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <FaBullseye className="w-3 h-3" />
              <span>Target: {progressData.targetValue}%</span>
            </div>
            {goal.courseId && (
            <div className="flex items-center space-x-1">
              <span>•</span>
              <span>{getCourseName(goal.courseId, courses)}</span>
            </div>
            )}
            {goal.goalType === 'SEMESTER_GPA' && goal.semester && goal.academicYear && (
              <div className="flex items-center space-x-1">
                <span>•</span>
                <span>{goal.semester === 'FIRST' ? '1st' : goal.semester === 'SECOND' ? '2nd' : '3rd'} Sem {goal.academicYear}</span>
              </div>
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
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit Goal"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete Goal"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Course Completion Status */}
      {progressData.isCourseCompleted && (
        <div className={`p-3 rounded-lg border mb-4 ${
          progressData.status === 'achieved' 
            ? 'bg-green-50 border-green-200' 
            : progressData.status === 'close_to_goal'
            ? 'bg-purple-50 border-purple-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              progressData.status === 'achieved' 
                ? 'bg-green-500' 
                : progressData.status === 'close_to_goal'
                ? 'bg-purple-500'
                : 'bg-orange-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              progressData.status === 'achieved' 
                ? 'text-green-800' 
                : progressData.status === 'close_to_goal'
                ? 'text-purple-800'
                : 'text-orange-800'
            }`}>
              Course Completed
            </span>
          </div>
          <div className={`mt-1 text-sm ${
            progressData.status === 'achieved' 
              ? 'text-green-700' 
              : progressData.status === 'close_to_goal'
              ? 'text-purple-700'
              : 'text-orange-700'
          }`}>
            {progressData.status === 'achieved' 
              ? `🎉 Amazing work! You crushed your target of ${progressData.targetValue}% with an outstanding ${progressData.currentValue}%! You're on fire! 🔥`
              : progressData.status === 'close_to_goal'
              ? `✨ So close! You got ${progressData.currentValue}% (Target: ${progressData.targetValue}%) - just ${Math.round(progressData.targetValue - progressData.currentValue)}% away! You're almost there! 💪`
              : `💪 Great effort! You finished with ${progressData.currentValue}% (Target: ${progressData.targetValue}%). Every step counts - keep pushing forward! You've got this! 🚀`
            }
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-sm font-medium text-gray-600 min-w-0 flex-shrink-0">
          {progressData.isCourseCompleted ? 'Course Progress:' : 'Progress:'}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${progressData.progress}%` }}
          ></div>
        </div>
        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">
            {progressData.progress}%
          </span>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
            {statusInfo.text}
          </div>
        </div>
      </div>

      {/* Current vs Target Performance */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div>
          Current: <span className="font-semibold text-gray-800">{progressData.currentValue}%</span>
        </div>
        <div>
          Target: <span className="font-semibold text-gray-800">{progressData.targetValue}%</span>
        </div>
      </div>

      {/* Motivational Indicator for Ongoing Courses */}
      {!progressData.isCourseCompleted && (
        <div className={`p-2 rounded-lg mb-4 ${
          progressData.status === 'close_to_goal'
            ? 'bg-purple-50 border border-purple-200'
            : progressData.progress >= 80 
            ? 'bg-green-50 border border-green-200'
            : progressData.progress >= 60
            ? 'bg-blue-50 border border-blue-200'
            : progressData.progress >= 40
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${
              progressData.status === 'close_to_goal'
                ? 'text-purple-700'
                : progressData.progress >= 80 
                ? 'text-green-700'
                : progressData.progress >= 60
                ? 'text-blue-700'
                : progressData.progress >= 40
                ? 'text-yellow-700'
                : 'text-gray-700'
            }`}>
              {progressData.status === 'close_to_goal'
                ? `✨ So close! You're at ${progressData.currentValue}% (Target: ${progressData.targetValue}%) - just ${Math.round(progressData.targetValue - progressData.currentValue)}% away! You're almost there! 💪`
                : progressData.progress >= 80 
                ? '🔥 You\'re crushing it! Keep up the momentum!'
                : progressData.progress >= 60
                ? '💪 Great progress! You\'re on the right track!'
                : progressData.progress >= 40
                ? '⭐ You\'re making progress! Every step counts!'
                : '🚀 You\'ve got this! Every journey starts with a single step!'
              }
            </span>
          </div>
        </div>
      )}

      {/* Achievement Probability - Only show for ongoing courses */}
      {!progressData.isCourseCompleted && !isCompact && (
        <div className="flex items-center space-x-2 text-sm mb-4">
          <span className="text-gray-600">Achievement Probability:</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  progressData.achievementProbability >= 70
                    ? 'bg-green-500'
                    : progressData.achievementProbability >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${progressData.achievementProbability}%` }}
              ></div>
            </div>
            <span className={`font-semibold ${
              progressData.achievementProbability >= 70
                ? 'text-green-600'
                : progressData.achievementProbability >= 40
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {progressData.achievementProbability}%
            </span>
          </div>
        </div>
      )}

      {/* Remaining Value - Only show for ongoing courses */}
      {!progressData.isCourseCompleted && progressData.remainingValue > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Remaining:</span> {progressData.remainingValue}% to reach target
        </div>
      )}
    </div>
  );
};

export default GoalCard;

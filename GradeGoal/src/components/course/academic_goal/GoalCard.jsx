// ========================================
// GOAL CARD COMPONENT
// ========================================
// This component displays individual goal cards with progress information

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Edit2, Trash2, Target, Calendar, TrendingUp, TrendingDown, Book, Award, Clock } from "lucide-react";
import { calculateGoalProgress, getProgressStatusInfo, getProgressBarColor } from "./goalProgress";
import { getGoalTypeLabel, getPriorityColor, getCourseName, formatGoalDate } from "./goalUtils";
import AIAnalysisButton from "../../ai/components/AIAnalysisButton";
import { getAssessmentCategoriesByCourseId } from "../../../backend/api";

const GoalCard = ({
  goal,
  courses,
  grades,
  onEdit,
  onDelete,
  isCompact = false,
  allGoals = [],
  isGridLayout = false
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

  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

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

  // Fetch assessment categories for course goals
  useEffect(() => {
    const loadCategories = async () => {
      if (!goal?.courseId || goal.goalType !== 'COURSE_GRADE') return;
      
      setIsLoadingCategories(true);
      try {
        const categoriesData = await getAssessmentCategoriesByCourseId(goal.courseId);
        const transformedCategories = categoriesData.map(category => ({
          id: category.categoryId || category.id,
          categoryName: category.categoryName || category.name,
          weight: category.weightPercentage || category.weight,
          weightPercentage: category.weightPercentage || category.weight,
          orderSequence: category.orderSequence
        }));
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Failed to load assessment categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [goal?.courseId, goal?.goalType]);

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

  // Get priority colors and styles
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'HIGH':
        return {
          background: 'bg-gradient-to-r from-red-50 to-pink-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700',
          icon: 'text-red-600'
        };
      case 'MEDIUM':
        return {
          background: 'bg-gradient-to-r from-yellow-50 to-orange-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700',
          icon: 'text-yellow-600'
        };
      case 'LOW':
        return {
          background: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-700',
          icon: 'text-green-600'
        };
      default:
        return {
          background: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-700',
          icon: 'text-gray-600'
        };
    }
  };

  const priorityStyles = getPriorityStyles(goal.priority);

  return (
    <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg border ${priorityStyles.border} transition-all duration-300 overflow-hidden`}>
      {/* Clean Header */}
      <div className={`${priorityStyles.background} p-4 relative`}>
        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex space-x-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white/60 rounded-lg transition-all duration-200"
            title="Edit Goal"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white/60 rounded-lg transition-all duration-200"
            title="Delete Goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Course Name - Main Focus */}
        <div className="text-center mb-3 mx-auto max-w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-2 px-16" title={goal.courseId ? getCourseName(goal.courseId, courses) : goal.goalTitle}>
            {goal.courseId ? getCourseName(goal.courseId, courses) : goal.goalTitle}
          </h3>
          
          {/* Priority Badge */}
          <div className="flex justify-center mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityStyles.badge}`}>
              {goal.priority} PRIORITY
            </span>
          </div>
          
          {/* Goal Type & Due Date */}
          <div className="space-y-1">
            <div className="text-sm text-gray-600 font-medium">{getGoalTypeLabel(goal.goalType)}</div>
            <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatGoalDate(goal.targetDate)}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-5">
        {/* Progress Overview - Clean & Simple */}
        <div className="text-center mb-5">
          {/* Current vs Target - Side by Side */}
          <div className="flex items-center justify-center space-x-6 mb-4">
            {/* Current GPA */}
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                progressData.currentValue >= progressData.targetValue 
                  ? 'text-green-600' 
                  : progressData.currentValue >= progressData.targetValue * 0.8
                  ? 'text-blue-600'
                  : progressData.currentValue >= progressData.targetValue * 0.6
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {progressData.currentValue.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current</div>
            </div>
            
            {/* Separator */}
            <div className="text-gray-300 text-2xl">/</div>
            
            {/* Target GPA */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {progressData.targetValue}
              </div>
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Target</div>
            </div>
          </div>

          {/* Progress Bar - Clean Design */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">{progressData.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  progressData.progress >= 80
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : progressData.progress >= 60
                    ? "bg-gradient-to-r from-blue-400 to-blue-500"
                    : progressData.progress >= 40
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    : "bg-gradient-to-r from-red-400 to-red-500"
                }`}
                style={{ width: `${progressData.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Status & Points Needed */}
          <div className="space-y-2">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              progressData.isAchieved 
                ? 'bg-green-100 text-green-700' 
                : progressData.isOnTrack 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              <span className="text-sm">
                {progressData.isAchieved ? '✅' : progressData.isOnTrack ? '📈' : '⚠️'}
              </span>
              <span className="text-sm font-semibold">
                {progressData.isAchieved ? 'Goal Achieved!' : progressData.isOnTrack ? 'On Track' : 'Needs Focus'}
              </span>
            </div>
            
            {!progressData.isAchieved && (
              <div className="text-sm text-gray-600">
                <span className="font-bold text-orange-600">{(progressData.targetValue - progressData.currentValue).toFixed(2)}</span> points needed to reach your goal
              </div>
            )}
          </div>
        </div>

        {/* Course Completion Status */}
        {progressData.isCourseCompleted && (
          <div className={`mt-4 p-4 rounded-xl ${
            progressData.status === 'achieved' 
              ? 'bg-green-50 border border-green-200' 
              : progressData.status === 'close_to_goal'
              ? 'bg-purple-50 border border-purple-200'
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="text-center">
              <div className={`text-2xl mb-2`}>
                {progressData.status === 'achieved' ? '🎉' : progressData.status === 'close_to_goal' ? '✨' : '💪'}
              </div>
              <div className={`text-sm font-semibold mb-1 ${
                progressData.status === 'achieved' 
                  ? 'text-green-800' 
                  : progressData.status === 'close_to_goal'
                  ? 'text-purple-800'
                  : 'text-orange-800'
              }`}>
                Course Completed!
              </div>
              <div className={`text-xs ${
                progressData.status === 'achieved' 
                  ? 'text-green-700' 
                  : progressData.status === 'close_to_goal'
                  ? 'text-purple-700'
                  : 'text-orange-700'
              }`}>
                {progressData.status === 'achieved' 
                  ? `Amazing! You exceeded your target with ${progressData.currentValue} GPA!`
                  : progressData.status === 'close_to_goal'
                  ? `So close! You achieved ${progressData.currentValue} GPA`
                  : `Great effort! Final GPA: ${progressData.currentValue}`
                }
              </div>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {!progressData.isCourseCompleted && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2 inline-block">
              🚀 Every journey starts with a single step!
            </div>
          </div>
        )}


        {/* AI Analysis Section - Clean & Centered */}
        {!progressData.isCourseCompleted && !isCompact && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-center">
              <AIAnalysisButton
                course={courses.find(c => c.id === goal.courseId)}
                goal={goal}
                grades={(() => {
                  // Get grades for this specific course by collecting all grades from categories
                  if (!goal.courseId || !categories.length) return [];
                  
                  const courseGrades = [];
                  categories.forEach(category => {
                    const categoryGrades = grades[category.id] || [];
                    courseGrades.push(...categoryGrades);
                  });
                  
                  return courseGrades;
                })()}
                categories={categories}
                onAnalysisComplete={(recommendations) => {
                  // Handle the AI analysis completion
                }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GoalCard;
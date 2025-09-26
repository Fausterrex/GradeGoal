// ========================================
// GOAL CARD COMPONENT
// ========================================
// This component displays individual goal cards with progress information

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaEdit, FaTimes, FaBullseye, FaCalendarAlt } from "react-icons/fa";
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
        console.log('🎯 GoalCard - Raw categories data:', categoriesData);
        
        const transformedCategories = categoriesData.map(category => ({
          id: category.categoryId || category.id,
          categoryName: category.categoryName || category.name,
          weight: category.weightPercentage || category.weight,
          weightPercentage: category.weightPercentage || category.weight,
          orderSequence: category.orderSequence
        }));
        
        console.log('🎯 GoalCard - Transformed categories:', transformedCategories);
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-300 hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className={`flex items-start justify-between mb-4 p-6 rounded-t-xl ${goal.priority === "LOW"
        ? "bg-green-100"
        : goal.priority === "MEDIUM"
          ? "bg-orange-100"
          : goal.priority === "HIGH"
            ? "bg-red-100"
            : "bg-gray-100"
        }`}>
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
              <span>Target: {progressData.targetValue}</span>
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
      <div className="p-6">
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
              {progressData.currentValue}
            </span>
          </div>
          <div>
            Target:{" "}
            <span className="font-semibold text-gray-800">
              {progressData.targetValue}
            </span>
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
                ? `🎉 Amazing work! You crushed your target of ${progressData.targetValue} GPA with an outstanding ${progressData.currentValue} GPA! You're on fire! 🔥`
                : progressData.status === 'close_to_goal'
                ? `✨ So close! You got ${progressData.currentValue} GPA (Target: ${progressData.targetValue} GPA) - just ${(progressData.targetValue - progressData.currentValue).toFixed(2)} GPA points away! You're almost there! 💪`
                : `💪 Great effort! You finished with ${progressData.currentValue} GPA (Target: ${progressData.targetValue} GPA). Every step counts - keep pushing forward! You've got this! 🚀`
              }
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {!progressData.isCourseCompleted && (
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 mb-4">
            <span className="text-sm text-gray-700">
              🚀 You've got this! Every journey starts with a single step!
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

        {/* AI Analysis Button */}
        {!progressData.isCourseCompleted && !isCompact && (
          <div className="mb-4">
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
                
                console.log('🎯 GoalCard - Course-specific grades:', {
                  courseId: goal.courseId,
                  categoriesCount: categories.length,
                  totalGrades: courseGrades.length,
                  gradesByCategory: categories.map(cat => ({
                    categoryId: cat.id,
                    categoryName: cat.categoryName || cat.name,
                    gradesCount: (grades[cat.id] || []).length
                  }))
                });
                
                return courseGrades;
              })()}
              categories={categories}
              onAnalysisComplete={(recommendations) => {
                console.log('AI Analysis completed:', recommendations);
                // Handle the AI analysis completion
              }}
            />
          </div>
        )}

        {/* Remaining */}
        {!progressData.isCourseCompleted && progressData.remainingValue > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Remaining:</span>{" "}
            {progressData.remainingValue.toFixed(2)} GPA points to reach target
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
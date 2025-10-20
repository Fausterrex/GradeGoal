// ========================================
// GOAL CARD COMPONENT
// ========================================
// This component displays individual goal cards with progress information

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Edit2, Trash2, Target, Calendar, TrendingUp, TrendingDown, Book, Award, Clock } from "lucide-react";
import { calculateGoalProgress, getProgressStatusInfo, getProgressBarColor } from "./goalProgress";
import { getGoalTypeLabel, getPriorityColor, getCourseName, formatGoalDate } from "./goalUtils";
import AIAnalysisIndicator from "../../ai/components/AIAnalysisIndicator";
import AIAchievementProbability from "../../ai/components/AIAchievementProbability";
import { getAssessmentCategoriesByCourseId, checkAIAnalysisExists } from "../../../backend/api";
import { getAchievementProbability, getAchievementProbabilityFromData, loadAIAnalysisForCourse } from "../../ai/services/aiAnalysisService";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../../backend/api";

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
  const [aiAchievementProbability, setAiAchievementProbability] = useState(null);
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false);
  
  const { currentUser } = useAuth();

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

  // Load existing AI analysis and achievement probability on mount
  useEffect(() => {
    const loadExistingAIAnalysis = async () => {
      if (!goal || !currentUser?.email) return;
      
      try {
        // Get user profile to get database user ID
        const userProfile = await getUserProfile(currentUser.email);
        if (!userProfile?.userId) return;
        
        // Skip AI analysis check for cumulative GPA and semester GPA goals (show "Coming Soon")
        if (goal.goalType === 'CUMMULATIVE_GPA' || goal.goalType === 'SEMESTER_GPA') {
          setHasExistingAnalysis(false);
          return;
        }
        
        // For course-specific goals, check if AI analysis exists
        if (!goal.courseId) {
          setHasExistingAnalysis(false);
          return;
        }
        
        // Check if AI analysis exists for course-specific goals
        const existsResponse = await checkAIAnalysisExists(userProfile.userId, goal.courseId);
        const exists = existsResponse.success && existsResponse.exists;
        
        
        setHasExistingAnalysis(exists);
        
        // If analysis exists, load the analysis data first, then get the achievement probability
        if (exists) {
          try {
            // Load the analysis data into memory first
            const analysisData = await loadAIAnalysisForCourse(userProfile.userId, goal.courseId);
            if (analysisData) {
              
              // Get probability directly from the loaded analysis data
              const probability = getAchievementProbabilityFromData(analysisData);
              if (probability) {
                setAiAchievementProbability(probability);
              } else {
              }
            } else {
            }
          } catch (error) {
            }
        }
      } catch (error) {
        }
    };
    
    loadExistingAIAnalysis();
  }, [goal, currentUser?.email]);

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

  // Check if course is completed (for course-specific goals)
  const isCourseCompleted = useMemo(() => {
    // For non-course goals (Cumulative GPA, Semester GPA), they should always be editable
    if (!goal.courseId) return false;
    const course = courses.find(c => c.courseId === goal.courseId);
    return course?.isCompleted === true;
  }, [goal.courseId, courses]);

  // Get goal type specific colors
  const getGoalTypeColors = (goalType) => {
    switch (goalType) {
      case 'COURSE_GRADE':
        return {
          cardBg: 'bg-green-50',
          headerBg: 'bg-gradient-to-r from-green-500 to-green-600',
          border: 'border-green-200'
        };
      case 'SEMESTER_GPA':
        return {
          cardBg: 'bg-purple-50',
          headerBg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          border: 'border-purple-200'
        };
      case 'CUMMULATIVE_GPA':
        return {
          cardBg: 'bg-orange-50',
          headerBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
          border: 'border-orange-200'
        };
      default:
        return {
          cardBg: 'bg-white',
          headerBg: priorityStyles.background,
          border: priorityStyles.border
        };
    }
  };

  const goalTypeColors = getGoalTypeColors(goal.goalType);

  return (
    <div className={`${goalTypeColors.cardBg} rounded-2xl shadow-md hover:shadow-lg border ${goalTypeColors.border} transition-all duration-300 overflow-hidden`}>
      {/* Clean Header */}
      <div className={`${goalTypeColors.headerBg} p-4 relative`}>
        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex space-x-1">
          <button
            onClick={() => onEdit(goal)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              isCourseCompleted 
                ? 'text-gray-300 cursor-not-allowed opacity-50' 
                : 'text-white hover:text-blue-200 hover:bg-white/20 bg-white/10'
            }`}
            title="Edit Goal"
            disabled={isCourseCompleted}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              isCourseCompleted 
                ? 'text-gray-300 cursor-not-allowed opacity-50' 
                : 'text-white hover:text-red-200 hover:bg-white/20 bg-white/10'
            }`}
            title="Delete Goal"
            disabled={isCourseCompleted}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Goal Title - Main Focus */}
        <div className="text-center mb-3 mx-auto max-w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-2 px-16" title={goal.goalTitle || (goal.courseId ? getCourseName(goal.courseId, courses) : 'Untitled Goal')}>
            {goal.goalTitle || (goal.courseId ? getCourseName(goal.courseId, courses) : 'Untitled Goal')}
          </h3>
          
          {/* Priority Badge and Achievement Status */}
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityStyles.badge}`}>
              {goal.priority} PRIORITY
            </span>
            {goal.isAchieved && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <Award className="w-3 h-3 mr-1" />
                ACHIEVED
              </span>
            )}
          </div>
          
          {/* Goal Type & Due Date */}
          <div className="space-y-1">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              goal.goalType === 'COURSE_GRADE' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : goal.goalType === 'SEMESTER_GPA'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-purple-100 text-purple-700 border border-purple-200'
            }`}>
              {getGoalTypeLabel(goal.goalType)}
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span>
                {goal.isAchieved && goal.achievedDate 
                  ? `Achieved: ${formatGoalDate(goal.achievedDate)}`
                  : `Target: ${formatGoalDate(goal.targetDate)}`
                }
              </span>
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
                : progressData.isCourseCompleted
                ? 'bg-purple-100 text-purple-700'
                : progressData.isOnTrack 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              <span className="text-sm">
                {progressData.isAchieved ? '✅' : progressData.isCourseCompleted ? '📊' : progressData.isOnTrack ? '📈' : '⚠️'}
              </span>
              <span className="text-sm font-semibold">
                {progressData.isAchieved 
                  ? 'Goal Achieved!' 
                  : progressData.isCourseCompleted
                  ? 'Course Completed'
                  : progressData.isOnTrack 
                  ? 'On Track' 
                  : 'Needs Focus'
                }
              </span>
            </div>
            
            {!progressData.isAchieved && (
              <div className="text-sm text-gray-600">
                {progressData.isCourseCompleted ? (
                  <>
                    <span className="font-bold text-purple-600">{(progressData.targetValue - progressData.currentValue).toFixed(2)}</span> GPA gap from target
                  </>
                ) : (
                  <>
                    <span className="font-bold text-orange-600">{(progressData.targetValue - progressData.currentValue).toFixed(2)}</span> points needed to reach your goal
                  </>
                )}
              </div>
            )}
          </div>
        </div>




        {/* AI Analysis Section - Clean & Centered */}
        {!isCompact && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-center">
              {/* Requirement Indicator */}
              {(() => {
                const getRequirementInfo = () => {
                  if (goal.goalType === 'COURSE_GRADE') {
                    // Count current assessments
                    let assessmentCount = 0;
                  categories.forEach(category => {
                    const categoryGrades = grades[category.id] || [];
                      categoryGrades.forEach(grade => {
                        if (grade.score !== null && grade.score !== undefined && grade.score > 0) {
                          assessmentCount++;
                        }
                      });
                    });
                    
                    const needed = Math.max(0, 2 - assessmentCount);
                    return {
                      current: assessmentCount,
                      required: 2,
                      type: 'assessments',
                      message: needed > 0 
                        ? `Need ${needed} more assessment${needed > 1 ? 's' : ''} for AI analysis`
                        : 'Ready for AI analysis'
                    };
                  } else if (goal.goalType === 'SEMESTER_GPA') {
                    // Count courses with assessments
                    let coursesWithAssessments = 0;
                    courses.forEach(course => {
                      if (course.categories && course.categories.length > 0) {
                        let hasValidAssessments = false;
                        course.categories.forEach(category => {
                          const categoryGrades = grades[category.id] || [];
                          if (categoryGrades.some(grade => 
                            grade.score !== null && grade.score !== undefined && grade.score > 0
                          )) {
                            hasValidAssessments = true;
                          }
                        });
                        if (hasValidAssessments) {
                          coursesWithAssessments++;
                        }
                      }
                    });
                    
                    const needed = Math.max(0, 3 - coursesWithAssessments);
                    return {
                      current: coursesWithAssessments,
                      required: 3,
                      type: 'courses',
                      message: needed > 0 
                        ? `Need ${needed} more course${needed > 1 ? 's' : ''} with assessments for AI analysis`
                        : 'Ready for AI analysis'
                    };
                  } else if (goal.goalType === 'CUMMULATIVE_GPA') {
                    // Count courses with assessments (representing semesters)
                    let coursesWithAssessments = 0;
                    courses.forEach(course => {
                      if (course.categories && course.categories.length > 0) {
                        let hasValidAssessments = false;
                        course.categories.forEach(category => {
                          const categoryGrades = grades[category.id] || [];
                          if (categoryGrades.some(grade => 
                            grade.score !== null && grade.score !== undefined && grade.score > 0
                          )) {
                            hasValidAssessments = true;
                          }
                        });
                        if (hasValidAssessments) {
                          coursesWithAssessments++;
                        }
                      }
                    });
                    
                    const needed = Math.max(0, 3 - coursesWithAssessments);
                    return {
                      current: coursesWithAssessments,
                      required: 3,
                      type: 'semesters',
                      message: needed > 0 
                        ? `Need ${needed} more semester${needed > 1 ? 's' : ''} with course data for AI analysis`
                        : 'Ready for AI analysis'
                    };
                  }
                  
                  return {
                    current: 0,
                    required: 2,
                    type: 'assessments',
                    message: 'Need more data for AI analysis'
                  };
                };
                
                const requirementInfo = getRequirementInfo();
                const isReady = requirementInfo.current >= requirementInfo.required;
                
                // Only show indicator if requirements are not met
                if (isReady) {
                  return null;
                }
                
                return (
                  <div className="mb-3">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                      <span className="mr-1">⏳</span>
                      {requirementInfo.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {requirementInfo.current} of {requirementInfo.required} {requirementInfo.type} available
                    </div>
                  </div>
                );
              })()}
              
              <AIAnalysisIndicator
                course={
                  goal.goalType === 'CUMMULATIVE_GPA' 
                    ? { id: 0, courseName: 'Cumulative GPA' } 
                    : goal.goalType === 'SEMESTER_GPA'
                    ? { id: 0, courseName: 'Semester GPA' }
                    : courses.find(c => c.id === goal.courseId)
                }
                grades={grades}
                categories={categories}
                targetGrade={goal}
                currentGrade={progressData.currentValue}
                courses={courses}
                onAnalysisComplete={async (recommendations) => {
                  // Handle the AI analysis completion
                  // Get AI achievement probability after analysis completion
                  try {
                    const probability = getAchievementProbability();
                    if (probability) {
                      setAiAchievementProbability(probability);
                    }
                  } catch (error) {
                    }
                }}
              />
            </div>
          </div>
        )}

        {/* AI Achievement Probability */}
        {aiAchievementProbability && (
          <div className="mt-4 mx-auto max-w-md">
            <AIAchievementProbability
              probability={aiAchievementProbability.probability}
              confidence={aiAchievementProbability.confidence}
              factors={aiAchievementProbability.factors}
              bestPossibleGPA={aiAchievementProbability.bestPossibleGPA}
              isVisible={true}
              isCompact={isCompact}
              currentGPA={progressData.currentValue}
              targetGPA={goal.targetValue}
              courseProgress={progressData.progressPercentage}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default GoalCard;
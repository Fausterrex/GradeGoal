// ========================================
// GOAL PROGRESS COMPONENT
// ========================================
// Simple and clean goal progress display

import React, { useState, useEffect } from "react";
import { convertToGPA } from "../../academic_goal/gpaConversionUtils";
import AIAchievementProbability from "../../../ai/components/AIAchievementProbability";
import { RefreshCw } from "lucide-react";
import { getAchievementProbability, subscribeToAIAnalysis } from "../../../ai/services/aiAnalysisService";

function GoalProgress({
  currentGrade,
  targetGrade,
  course,
  colorScheme,
  grades = {},
  categories = [],
  onSetGoal = () => {}, // Callback for when user wants to set a goal
  isCompact = false // New prop for compact layout
}) {

  const [aiAchievementProbability, setAiAchievementProbability] = useState(null);

  // Subscribe to AI analysis data changes
  useEffect(() => {
    const unsubscribe = subscribeToAIAnalysis((analysisData) => {
      if (analysisData) {
        // Only show AI analysis if there are actual assessments to analyze
        const hasAssessments = categories.some(cat => {
          const catGrades = grades[cat.id] || [];
          return catGrades.length > 0;
        });
        
        if (hasAssessments) {
          const probability = getAchievementProbability();
          
      // Override probability calculation if goal is already achieved
      // Convert target grade to GPA for proper comparison
      const currentGPA = typeof currentGrade === 'number' ? currentGrade : 0;
      const targetGPA = convertToGPA(targetGrade, course?.gpaScale === '5.0' ? 5.0 : 4.0);
      
      console.log('🎯 [GoalProgress] AI Probability Debug (callback):', {
        currentGrade,
        targetGrade,
        currentGPA,
        targetGPA,
        isGoalAchieved: currentGPA >= targetGPA,
        originalProbability: probability?.probability,
        probabilityObject: probability
      });
      
      if (probability && currentGPA >= targetGPA) {
        const correctedProbability = {
          ...probability,
          probability: 100 // Force 100% when goal is achieved
        };
        console.log('🎯 [GoalProgress] Correcting probability from', probability.probability, 'to 100% (callback)');
        setAiAchievementProbability(correctedProbability);
      } else {
        setAiAchievementProbability(probability);
      }
        } else {
          setAiAchievementProbability(null); // Hide AI components when no assessments
        }
      }
    });

    // Get initial probability only if there are assessments
    const hasAssessments = categories.some(cat => {
      const catGrades = grades[cat.id] || [];
      return catGrades.length > 0;
    });
    
    if (hasAssessments) {
      const probability = getAchievementProbability();
      
      // Override probability calculation if goal is already achieved
      // Convert target grade to GPA for proper comparison
      const currentGPA = typeof currentGrade === 'number' ? currentGrade : 0;
      const targetGPA = convertToGPA(targetGrade, course?.gpaScale === '5.0' ? 5.0 : 4.0);
      
      if (probability && currentGPA >= targetGPA) {
        const correctedProbability = {
          ...probability,
          probability: 100 // Force 100% when goal is achieved
        };
        setAiAchievementProbability(correctedProbability);
      } else {
        setAiAchievementProbability(probability);
      }
    } else {
      setAiAchievementProbability(null); // Hide AI components when no assessments
    }

    return unsubscribe;
  }, [categories, grades, currentGrade, targetGrade]); // Add dependencies to re-check when data changes

  // Calculate course completion progress
  const calculateCourseCompletion = () => {
    if (!categories || categories.length === 0) return 0;
    
    let totalAssessments = 0;
    let completedAssessments = 0;
    
    categories.forEach(category => {
      const categoryGrades = grades[category.id] || [];
      totalAssessments += categoryGrades.length; // Count actual assessments
      categoryGrades.forEach(grade => {
        // Only count as completed if there's a meaningful score (> 0)
        if (grade.score !== null && grade.score !== undefined && grade.score > 0) {
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
        {currentGrade != null && currentGrade > 0 && (
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
      totalAssessments += categoryGrades.length; // Count actual assessments
      categoryGrades.forEach(grade => {
        // Only count as completed if there's a meaningful score (> 0)
        if (grade.score !== null && grade.score !== undefined && grade.score > 0) {
          completedAssessments++;
        }
      });
    });
    
    courseProgress = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
  }
  
  // Calculate progress percentage based on actual course progress
  let progressPercentage = courseProgress;
  
  // Only show 100% if course is actually 100% complete AND goal is achieved
  if (courseProgress >= 100 && currentGPA >= targetGPA) {
    progressPercentage = 100;
  } else {
    progressPercentage = courseProgress;
  }
  

  // Extract color names from Tailwind classes (e.g., "bg-blue-600" -> "blue")
  const getColorName = (colorClass) => {
    if (!colorClass) return null;
    const match = colorClass.match(/(?:bg-|text-)([a-z]+)-\d+/);
    return match ? match[1] : null;
  };

  const primaryColor = getColorName(colorScheme?.primary) || 'blue';
  const secondaryColor = getColorName(colorScheme?.secondary) || 'indigo';
  const accentColor = getColorName(colorScheme?.accent?.replace('text-', 'bg-')) || 'purple';
  
  // Achievement probability is now handled by AI analysis only

  const getProgressColor = () => {
    if (progressPercentage >= 90) return "bg-green-500";
    if (progressPercentage >= 70) return "bg-yellow-500";
    if (progressPercentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusText = () => {
    // Check if course is completed (100% progress)
    const isCourseCompleted = courseProgress >= 100;
    
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
    <div className={`bg-gradient-to-br from-white via-gray-50 to-${primaryColor}-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${isCompact ? 'h-fit' : ''}`}>
      {/* Header Section with Gradient */}
      <div className={`bg-gradient-to-r from-${primaryColor}-600 via-${secondaryColor}-600 to-${accentColor}-600 ${isCompact ? 'px-4 py-3' : 'px-8 py-6'} text-center relative overflow-hidden`}>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className={`flex items-center justify-center ${isCompact ? 'space-x-2 mb-1' : 'space-x-3 mb-2'}`}>
            <div className={`${isCompact ? 'w-6 h-6' : 'w-8 h-8'} bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm`}>
              <span className={`text-white ${isCompact ? 'text-sm' : 'text-lg'}`}>🎯</span>
            </div>
            <h3 className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              Goal Progress
            </h3>
          </div>
          
          {/* Status Badge in Header */}
          <div className={`${isCompact ? 'mt-2' : 'mt-3'}`}>
            <span className={`inline-flex items-center ${isCompact ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'} rounded-full font-semibold backdrop-blur-sm border border-white/20 ${
              currentGPA >= targetGPA ? "bg-emerald-500/20 text-emerald-100" :
              courseProgress >= 100 ? `bg-${accentColor}-500/20 text-${accentColor}-100` :
              progressPercentage >= 90 ? "bg-green-500/20 text-green-100" :
              progressPercentage >= 70 ? "bg-yellow-500/20 text-yellow-100" :
              progressPercentage >= 50 ? "bg-orange-500/20 text-orange-100" :
              "bg-red-500/20 text-red-100"
            }`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isCompact ? 'px-4 py-4' : 'px-8 py-8'}`}>
        {/* Progress Circle - Enhanced */}
        <div className={`flex justify-center ${isCompact ? 'mb-4' : 'mb-8'}`}>
          <div className="relative">
            {/* Outer Glow Ring */}
            <div className={`absolute inset-0 bg-gradient-to-r from-${primaryColor}-400 to-${accentColor}-400 rounded-full blur-lg opacity-15 scale-105`}></div>
            
            {/* Progress Circle */}
            <div className={`relative ${isCompact ? 'w-32 h-32' : 'w-52 h-52'} bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100`}>
              <svg className={`${isCompact ? 'w-28 h-28' : 'w-44 h-44'} transform -rotate-90`}>
                {/* Background Circle */}
                <circle
                  cx={isCompact ? "56" : "88"}
                  cy={isCompact ? "56" : "88"}
                  r={isCompact ? "45" : "70"}
                  stroke="#F3F4F6"
                  strokeWidth={isCompact ? "8" : "12"}
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx={isCompact ? "56" : "88"}
                  cy={isCompact ? "56" : "88"}
                  r={isCompact ? "45" : "70"}
                  stroke={`url(#gradient-${progressPercentage < 25 ? 'red' : progressPercentage < 50 ? 'orange' : progressPercentage < 80 ? primaryColor : 'green'})`}
                  strokeWidth={isCompact ? "8" : "12"}
                  fill="none"
                  strokeDasharray={2 * Math.PI * (isCompact ? 45 : 70)}
                  strokeDashoffset={
                    2 * Math.PI * (isCompact ? 45 : 70) - (progressPercentage / 100) * 2 * Math.PI * (isCompact ? 45 : 70)
                  }
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* SVG Gradients */}
                <defs>
                  <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                  <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                  <linearGradient id={`gradient-${primaryColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={primaryColor === 'red' ? '#EF4444' : primaryColor === 'green' ? '#22C55E' : primaryColor === 'purple' ? '#A855F7' : primaryColor === 'yellow' ? '#EAB308' : primaryColor === 'pink' ? '#EC4899' : primaryColor === 'indigo' ? '#6366F1' : primaryColor === 'teal' ? '#14B8A6' : primaryColor === 'cyan' ? '#06B6D4' : primaryColor === 'emerald' ? '#10B981' : primaryColor === 'orange' ? '#F97316' : '#3B82F6'} />
                    <stop offset="100%" stopColor={primaryColor === 'red' ? '#DC2626' : primaryColor === 'green' ? '#16A34A' : primaryColor === 'purple' ? '#9333EA' : primaryColor === 'yellow' ? '#CA8A04' : primaryColor === 'pink' ? '#DB2777' : primaryColor === 'indigo' ? '#4F46E5' : primaryColor === 'teal' ? '#0D9488' : primaryColor === 'cyan' ? '#0891B2' : primaryColor === 'emerald' ? '#059669' : primaryColor === 'orange' ? '#EA580C' : '#1D4ED8'} />
                  </linearGradient>
                  <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#16A34A" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`${isCompact ? 'text-xl' : 'text-4xl'} font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent`}>
                  {progressPercentage.toFixed(0)}%
                </span>
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-gray-500 ${isCompact ? 'mt-0' : 'mt-1'}`}>Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Achievement Probability */}
        {aiAchievementProbability && (
          <div className={`${isCompact ? 'mb-4' : 'mb-6'} mx-auto max-w-md`}>
            <AIAchievementProbability
              probability={aiAchievementProbability.probability}
              confidence={aiAchievementProbability.confidence}
              factors={aiAchievementProbability.factors}
              isVisible={true}
              isCompact={isCompact}
            />
          </div>
        )}

        {/* GPA Cards - Enhanced */}
        <div className={`grid grid-cols-${isCompact ? '1' : '2'} gap-${isCompact ? '3' : '6'} ${isCompact ? 'mb-4' : 'mb-8'}`}>
          <div className={`bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 ${isCompact ? 'p-3' : 'p-6'} text-center shadow-md hover:shadow-lg transition-all duration-300`}>
            <div className={`${isCompact ? 'w-6 h-6' : 'w-12 h-12'} bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto ${isCompact ? 'mb-1' : 'mb-3'}`}>
              <span className={`text-white ${isCompact ? 'text-xs' : 'text-lg'}`}>📊</span>
            </div>
            <div className={`${isCompact ? 'text-lg' : 'text-3xl'} font-bold text-gray-800 ${isCompact ? 'mb-0' : 'mb-1'}`}>
              {currentGPA.toFixed(2)}
            </div>
            <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-gray-600`}>Current GPA</div>
          </div>
          
          {!isCompact && (
            <div className={`bg-gradient-to-br from-${primaryColor}-50 to-${secondaryColor}-50 rounded-2xl border border-${primaryColor}-200 p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
              <div className={`w-12 h-12 bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="text-white text-lg">🎯</span>
              </div>
              <div className={`text-3xl font-bold text-${primaryColor}-700 mb-1`}>
                {targetGPA.toFixed(2)}
              </div>
              <div className={`text-sm font-medium text-${primaryColor}-600`}>Target GPA</div>
            </div>
          )}
          
          {isCompact && (
            <div className={`bg-gradient-to-br from-${primaryColor}-50 to-${secondaryColor}-50 rounded-xl border border-${primaryColor}-200 p-3 text-center shadow-md hover:shadow-lg transition-all duration-300`}>
              <div className={`w-6 h-6 bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500 rounded-full flex items-center justify-center mx-auto mb-1`}>
                <span className="text-white text-xs">🎯</span>
              </div>
              <div className={`text-lg font-bold text-${primaryColor}-700 mb-0`}>
                {targetGPA.toFixed(2)}
              </div>
              <div className={`text-xs font-medium text-${primaryColor}-600`}>Target GPA</div>
            </div>
          )}
        </div>

        {/* Status Messages - Enhanced */}
        {currentGPA < targetGPA && courseCompletion < 100 && (
          <div className={`bg-gradient-to-r from-${primaryColor}-50 via-${secondaryColor}-50 to-${accentColor}-50 rounded-2xl border border-${primaryColor}-200 ${isCompact ? 'p-4' : 'p-6'} text-center shadow-inner`}>
            <div className={`${isCompact ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-500 rounded-full flex items-center justify-center mx-auto ${isCompact ? 'mb-3' : 'mb-4'}`}>
              <span className={`text-white ${isCompact ? 'text-lg' : 'text-2xl'}`}>📈</span>
            </div>
            <div className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-gray-800 mb-2`}>
              Need {(targetGPA - currentGPA).toFixed(2)} more GPA points
            </div>
            <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-600`}>
              to reach your target GPA of {targetGPA.toFixed(2)}
            </div>
          </div>
        )}
        
        {/* Special message for completed courses that didn't reach goal */}
        {currentGPA < targetGPA && courseCompletion >= 100 && !isCompact && (
          <div className={`bg-gradient-to-r from-${accentColor}-50 via-pink-50 to-${accentColor}-50 rounded-2xl border border-${accentColor}-200 p-6 text-center shadow-inner`}>
            <div className={`w-16 h-16 bg-gradient-to-r from-${accentColor}-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-white text-2xl">📚</span>
            </div>
            <div className={`text-lg font-bold text-${accentColor}-800 mb-3`}>
              Course Completed!
            </div>
            <div className={`text-sm text-${accentColor}-700 mb-2`}>
              You finished strong with a {currentGPA.toFixed(2)} GPA!
            </div>
            <div className={`text-sm text-${accentColor}-600 mb-3`}>
              Just {(targetGPA - currentGPA).toFixed(2)} GPA points away from your target of {targetGPA.toFixed(2)}
            </div>
            <div className={`inline-flex items-center px-4 py-2 bg-${accentColor}-100 rounded-full text-sm font-medium text-${accentColor}-700`}>
              💪 Great effort! Every completed course builds your journey.
            </div>
          </div>
        )}
        
        {currentGPA >= targetGPA && !isCompact && (
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl border border-green-200 p-6 text-center shadow-inner">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎉</span>
            </div>
            <div className="text-xl font-bold text-green-800 mb-2">
              Goal Achieved!
            </div>
            <div className="text-sm text-green-600 mb-4">
              You've reached your target GPA of {targetGPA.toFixed(2)}
            </div>
            <div className="inline-flex items-center px-6 py-3 bg-green-100 rounded-full text-sm font-semibold text-green-700">
              🏆 Congratulations on your success!
            </div>
          </div>
        )}
        
        {/* Compact versions of success messages */}
        {currentGPA >= targetGPA && isCompact && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3 text-center shadow-inner">
            <div className="text-sm font-bold text-green-800 mb-1">
              🎉 Goal Achieved!
            </div>
            <div className="text-xs text-green-600">
              Target GPA of {targetGPA.toFixed(2)} reached!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoalProgress;

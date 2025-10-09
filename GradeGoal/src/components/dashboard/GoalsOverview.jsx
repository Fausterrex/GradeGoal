// ========================================
// GOALS OVERVIEW COMPONENT
// ========================================
// This component displays comprehensive goal tracking and progress overview
// Features: CGPA progress, quick stats, active goals, achievement predictions, celebrations, at-risk warnings

import React, { useState, useEffect, useMemo } from "react";
import { 
  Target, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  Star,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3
} from "lucide-react";
import { 
  getAcademicGoalsByUserId, 
  getUserProfile,
  checkGoalProgress,
  awardPoints,
  getAssessmentCategoriesByCourseId,
  checkAIAnalysisExists
} from "../../backend/api";
import { useAuth } from "../context/AuthContext";
import { useYearLevel } from "../context/YearLevelContext";
import { calculateGoalProgress, getProgressStatusInfo, getProgressBarColor } from "../course/academic_goal/goalProgress";
import { convertToGPA } from "../course/academic_goal/gpaConversionUtils";
import { getAchievementProbability, getAchievementProbabilityFromData, loadAIAnalysisForCourse } from "../ai/services/aiAnalysisService";
const GoalsOverview = ({ courses, gpaData, onGoalUpdate }) => {
  const { currentUser } = useAuth();
  const { selectedYearLevel, isAllYearsView } = useYearLevel();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [goals, setGoals] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  // atRiskGoals will be calculated as a useMemo below
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalCourses: 0,
    totalCredits: 0,
    achievements: 0,
    activeGoals: 0
  });

  // ========================================
  // DATA LOADING
  // ========================================
  useEffect(() => {
    if (currentUser) {
      loadGoalsData();
    }
  }, [currentUser, courses.length, selectedYearLevel, isAllYearsView]);

  const loadGoalsData = async () => {
    try {
      setIsLoading(true);
      
      // Get user profile
      const userProfile = await getUserProfile(currentUser.email);
      setUserId(userProfile.userId);

      // Load all goals
      const allGoals = await getAcademicGoalsByUserId(userProfile.userId);
      setGoals(allGoals);

      // Calculate quick stats
      const activeCourses = courses.filter(course => course.isActive !== false);
      const totalCredits = activeCourses.reduce((sum, course) => sum + (course.credits || 3), 0);
      
      setQuickStats({
        totalCourses: activeCourses.length,
        totalCredits,
        achievements: allGoals.filter(goal => goal.isAchieved).length,
        activeGoals: allGoals.filter(goal => !goal.isAchieved).length
      });

      // Check for recent achievements
      await checkRecentAchievements(allGoals);

    } catch (error) {
      console.error("Error loading goals data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRecentAchievements = async (allGoals) => {
    const recent = allGoals
      .filter(goal => goal.isAchieved && goal.achievedDate)
      .sort((a, b) => new Date(b.achievedDate) - new Date(a.achievedDate))
      .slice(0, 3);
    
    setRecentAchievements(recent);
  };

  // Calculate at-risk goals reactively based on academic year
  const atRiskGoals = useMemo(() => {
    if (!goals.length || !courses.length) {
      return [];
    }
    
    const atRisk = [];
    
    goals.forEach(goal => {
      if (goal.isAchieved) return;
      
      // For course goals, check if they match the selected academic year
      if (goal.goalType === 'COURSE_GRADE' && goal.courseId) {
        const course = courses.find(c => c.id === goal.courseId || c.courseId === goal.courseId);
        
        // Skip goals from courses that don't match the selected academic year
        if (!isAllYearsView && course && course.creationYearLevel && course.creationYearLevel !== selectedYearLevel) {
          return;
        }
      }
      
      // Calculate if goal is actually at-risk based on performance
      if (goal.goalType === 'COURSE_GRADE' && goal.courseId) {
        const course = courses.find(c => c.id === goal.courseId || c.courseId === goal.courseId);
        if (course) {
          // If course has good progress (80%+), goal is not at-risk
          const courseProgress = course.progress || 0;
          if (courseProgress >= 80) {
            return; // Skip this goal - it's not at-risk
          }
        }
      }
      
      // For GPA goals, we need different logic
      if (goal.goalType === 'SEMESTER_GPA' || goal.goalType === 'CUMMULATIVE_GPA') {
        // GPA goals are harder to assess without current GPA data
        // For now, be conservative and don't mark them as at-risk
        return;
      }
      
      // Only mark as at-risk if we have clear indicators of poor performance
      const isAtRisk = false; // Conservative approach - don't mark goals as at-risk without proper calculation
      
      if (isAtRisk) {
        atRisk.push({
          ...goal,
          progress: {
            achievementProbability: 25, // Mock value for now
            progressPercentage: 30, // Mock value for now
            status: 'at-risk'
          }
        });
      }
    });
    
    return atRisk;
  }, [goals, courses, selectedYearLevel, isAllYearsView]);

  const isWithinDays = (targetDate, days) => {
    if (!targetDate) return false;
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  };

  // ========================================
  // COMPUTED VALUES
  // ========================================
  const activeGoals = useMemo(() => {
    const filteredGoals = goals.filter(goal => {
      // Filter out achieved goals
      if (goal.isAchieved) return false;
      
      // For course goals, check if the course is archived and matches academic year
      if (goal.goalType === 'COURSE_GRADE' && goal.courseId) {
        const course = courses.find(c => c.id === goal.courseId || c.courseId === goal.courseId);
        
        // If no course found, this might be a goal from a course that's not in the current filtered view
        if (!course) {
          // This could mean the course is from a different academic year and was filtered out
          // In this case, we should hide the goal
          return false;
        }
        
        // Hide goal if course is archived (isActive === false)
        if (course.isActive === false) return false;
        
        // Filter by academic year if not in "All Years" view
        if (!isAllYearsView) {
          // Check if course's creationYearLevel matches selected year level
          if (course.creationYearLevel && course.creationYearLevel !== selectedYearLevel) {
            return false;
          }
        }
      }
      
      return true;
    });
    
    return filteredGoals;
  }, [goals, courses, selectedYearLevel, isAllYearsView]);


  // ========================================
  // RENDER HELPERS
  // ========================================
  const getGoalTypeIcon = (goalType) => {
    switch (goalType) {
      case 'COURSE_GRADE': return <BookOpen className="w-4 h-4" />;
      case 'SEMESTER_GPA': return <BarChart3 className="w-4 h-4" />;
      case 'CUMMULATIVE_GPA': return <Trophy className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatTargetValue = (goal) => {
    if (goal.goalType === 'COURSE_GRADE') {
      return `${goal.targetValue}%`;
    } else {
      const gpa = convertToGPA(goal.targetValue, 4.0);
      return `${typeof gpa === 'string' ? gpa : gpa.toFixed(2)} GPA`;
    }
  };

  const getAchievementTimeline = (goal) => {
    if (!goal.targetDate) return "No deadline set";
    
    const target = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    if (diffDays <= 7) return `${diffDays} days left`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
    return `${Math.ceil(diffDays / 30)} months left`;
  };

  const getGoalTypeLabel = (goalType, goal, courses) => {
    switch (goalType) {
      case 'COURSE_GRADE': 
        // Find the course name for this goal
        const course = courses.find(c => c.id === goal.courseId || c.courseId === goal.courseId);
        return course ? course.name : 'Course Goal';
      case 'SEMESTER_GPA': return 'Semester GPA';
      case 'CUMMULATIVE_GPA': return 'Cumulative GPA';
      default: return 'Academic Goal';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Goals Overview</h2>
            <p className="text-gray-600">Track your academic progress and achievements</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* ========================================
          QUICK STATS SECTION
          ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Courses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">{quickStats.totalCourses}</div>
              <div className="text-sm font-medium text-blue-600">Total Courses</div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Credits */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-700">{quickStats.totalCredits}</div>
              <div className="text-sm font-medium text-green-600">Total Credits</div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-700">{quickStats.achievements}</div>
              <div className="text-sm font-medium text-yellow-600">Achievements</div>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-700">{quickStats.activeGoals}</div>
              <div className="text-sm font-medium text-purple-600">Active Goals</div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>


      {/* ========================================
          AT-RISK GOALS WARNING
          ======================================== */}
      {(() => {
        return atRiskGoals.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">At-Risk Goals</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {atRiskGoals.length} need attention
              </span>
            </div>
            
            <div className="space-y-3">
              {atRiskGoals.slice(0, 3).map((goal, index) => (
                <div key={goal.goalId} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getGoalTypeIcon(goal.goalType)}
                      <div>
                        <div className="font-medium text-gray-900">{goal.goalTitle}</div>
                        <div className="text-sm text-gray-600">
                          {getGoalTypeLabel(goal.goalType, goal, courses)} • {formatTargetValue(goal)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {goal.progress?.achievementProbability || 25}% chance
                    </div>
                      <div className="text-xs text-gray-500">
                        {getAchievementTimeline(goal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ========================================
          ACTIVE GOALS SECTION
          ======================================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Active Goals</h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {activeGoals.length} goals
          </span>
        </div>
        
        {(() => {
          return activeGoals.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Active Goals</h4>
              <p className="text-gray-500">Set some academic goals to track your progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.slice(0, 6).map((goal) => (
                <GoalCard key={goal.goalId} goal={goal} courses={courses} gpaData={gpaData} />
              ))}
            </div>
          );
        })()}
      </div>

      {/* ========================================
          RECENT ACHIEVEMENTS CELEBRATION
          ======================================== */}
      {recentAchievements.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recent Achievements</h3>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              🎉 Celebrate!
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement, index) => (
              <div key={achievement.goalId} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{achievement.goalTitle}</div>
                    <div className="text-sm text-gray-600">
                      {formatTargetValue(achievement)} • {getGoalTypeLabel(achievement.goalType, achievement, courses)}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Achieved on {new Date(achievement.achievedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// GOAL CARD COMPONENT
// ========================================
const GoalCard = ({ goal, courses, gpaData }) => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAchievementProbability, setAiAchievementProbability] = useState(null);
  const [categories, setCategories] = useState([]);
  const { currentUser } = useAuth();

  // Helper function to get goal type label with course name
  const getGoalTypeLabel = (goalType, goal, courses) => {
    switch (goalType) {
      case 'COURSE_GRADE': 
        // Find the course name for this goal
        const course = courses.find(c => c.id === goal.courseId || c.courseId === goal.courseId);
        return course ? course.name : 'Course Goal';
      case 'SEMESTER_GPA': return 'Semester GPA';
      case 'CUMMULATIVE_GPA': return 'Cumulative GPA';
      default: return 'Academic Goal';
    }
  };

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        const progressData = await calculateGoalProgress(goal, courses, {}, gpaData, [goal]);
        setProgress(progressData);
      } catch (error) {
        console.error("Error calculating goal progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateProgress();
  }, [goal, courses, gpaData]);

  // Load AI achievement probability for course goals
  useEffect(() => {
    const loadAIAchievementProbability = async () => {
      if (!currentUser?.email || goal.goalType !== 'COURSE_GRADE' || !goal.courseId) return;
      
      try {
        // Get user profile to get database user ID
        const userProfile = await getUserProfile(currentUser.email);
        if (!userProfile?.userId) return;
        
        // Check if AI analysis exists
        const existsResponse = await checkAIAnalysisExists(userProfile.userId, goal.courseId);
        const exists = existsResponse.success && existsResponse.exists;
        
        
        if (exists) {
          // Load the analysis data
          const analysisData = await loadAIAnalysisForCourse(userProfile.userId, goal.courseId);
          if (analysisData) {
            // Get probability from the loaded analysis data
            const probability = getAchievementProbabilityFromData(analysisData);
            if (probability) {
              setAiAchievementProbability(probability);
            }
          }
        }
      } catch (error) {
        console.error("Error loading AI achievement probability:", error);
      }
    };

    loadAIAchievementProbability();
  }, [currentUser?.email, goal.goalType, goal.courseId]);

  // Load assessment categories for course goals
  useEffect(() => {
    const loadCategories = async () => {
      if (!goal?.courseId || goal.goalType !== 'COURSE_GRADE') return;
      
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
        console.error("Failed to load assessment categories:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, [goal?.courseId, goal.goalType]);

  if (isLoading || !progress) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const statusInfo = getProgressStatusInfo(progress.status);
  const progressBarColor = getProgressBarColor(progress.status, progress.progressPercentage);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            goal.goalType === 'COURSE_GRADE' ? 'bg-blue-100 text-blue-600' :
            goal.goalType === 'SEMESTER_GPA' ? 'bg-green-100 text-green-600' :
            'bg-purple-100 text-purple-600'
          }`}>
            {goal.goalType === 'COURSE_GRADE' ? <BookOpen className="w-4 h-4" /> :
             goal.goalType === 'SEMESTER_GPA' ? <BarChart3 className="w-4 h-4" /> :
             <Trophy className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{goal.goalTitle}</h4>
            <p className="text-sm text-gray-600">
              {getGoalTypeLabel(goal.goalType, goal, courses)} • {formatTargetValue(goal)}
            </p>
          </div>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progress.progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${progressBarColor}`}
            style={{ width: `${progress.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Achievement Probability - Progress Bar */}
      <div className="text-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Success Rate</span>
          </div>
          {aiAchievementProbability?.probability !== undefined ? (
            <span className={`font-medium ${
              (typeof aiAchievementProbability.probability === 'string' 
                ? parseFloat(aiAchievementProbability.probability.replace('%', '')) 
                : aiAchievementProbability.probability) >= 70 ? 'text-green-600' :
              (typeof aiAchievementProbability.probability === 'string' 
                ? parseFloat(aiAchievementProbability.probability.replace('%', '')) 
                : aiAchievementProbability.probability) >= 40 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {typeof aiAchievementProbability.probability === 'string' 
                ? aiAchievementProbability.probability 
                : `${aiAchievementProbability.probability}%`}
            </span>
          ) : (
            <span className="text-xs text-gray-500 italic">
              Get AI Analysis
            </span>
          )}
        </div>
        
        
        {aiAchievementProbability?.probability !== undefined ? (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                (typeof aiAchievementProbability.probability === 'string' 
                  ? parseFloat(aiAchievementProbability.probability.replace('%', '')) 
                  : aiAchievementProbability.probability) >= 70 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' :
                (typeof aiAchievementProbability.probability === 'string' 
                  ? parseFloat(aiAchievementProbability.probability.replace('%', '')) 
                  : aiAchievementProbability.probability) >= 40 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ 
                width: `${Math.min(Math.max(
                  typeof aiAchievementProbability.probability === 'string' 
                    ? parseFloat(aiAchievementProbability.probability.replace('%', '')) 
                    : aiAchievementProbability.probability, 0), 100)}%` 
              }}
            ></div>
          </div>
        ) : (
          <div className="w-full bg-gray-200 rounded-full h-2 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-600 font-medium bg-white px-2 py-1 rounded-full shadow-sm">
                Get AI Analysis to determine the success rate
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {goal.targetDate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{getAchievementTimeline(goal)}</span>
          </div>
        </div>
        )}
      </div>
    );
  };

// Helper function to format target value
const formatTargetValue = (goal) => {
  if (goal.goalType === 'COURSE_GRADE') {
    return `${goal.targetValue}%`;
  } else {
    const gpa = convertToGPA(goal.targetValue, 4.0);
    return `${typeof gpa === 'string' ? gpa : gpa.toFixed(2)} GPA`;
  }
};

// Helper function to get achievement timeline
const getAchievementTimeline = (goal) => {
  if (!goal.targetDate) return "No deadline set";
  
  const target = new Date(goal.targetDate);
  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `${diffDays} days left`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
  return `${Math.ceil(diffDays / 30)} months left`;
};

export default GoalsOverview;

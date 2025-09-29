// ========================================
// RECENT ACTIVITIES COMPONENT
// ========================================
// This component displays recent academic activities for the last 7-14 days
// Features: Grade entries, achievements, goal milestones, system notifications

import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, 
  Award, 
  Target, 
  Bell, 
  BookOpen, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Star
} from "lucide-react";
import { getUserProfile, getAcademicGoalsByUserId, getGradesByCourseId, getAssessmentCategoriesByCourseId, getAIAnalysis, logUserActivities } from "../../backend/api";
import { useAuth } from "../../context/AuthContext";

const RecentActivities = ({ courses }) => {
  const { currentUser } = useAuth();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [timeFilter, setTimeFilter] = useState(7); // 7 or 14 days
  const [activityFilter, setActivityFilter] = useState('all'); // all, grade_entry, notification, goal_achievement, goal_created

  // ========================================
  // DATA LOADING
  // ========================================
  useEffect(() => {
    if (currentUser && courses.length > 0) {
      loadRecentActivities();
    }
  }, [currentUser, courses.length, timeFilter]);

  // Filter activities based on selected filter
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') {
      return activities;
    }
    return activities.filter(activity => activity.type === activityFilter);
  }, [activities, activityFilter]);

  const loadRecentActivities = async () => {
    try {
      setIsLoading(true);
      
      // Get user profile
      const userProfile = await getUserProfile(currentUser.email);
      setUserId(userProfile.userId);

      // Load goals
      const allGoals = await getAcademicGoalsByUserId(userProfile.userId);
      setGoals(allGoals);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - timeFilter);

      // Fetch different types of activities
      const [recentGrades, recentNotifications, recentGoalChanges, recentAIAnalysis] = await Promise.all([
        fetchRecentGrades(userProfile.userId, startDate, endDate),
        fetchRecentNotifications(userProfile.userId, startDate, endDate),
        fetchRecentGoalChanges(allGoals, startDate, endDate),
        fetchRecentAIAnalysis(userProfile.userId, startDate, endDate)
      ]);

      // Combine and sort all activities
      const allActivities = [
        ...recentGrades,
        ...recentNotifications,
        ...recentGoalChanges,
        ...recentAIAnalysis
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setActivities(allActivities.slice(0, 20)); // Limit to 20 most recent

      // Save activities to database
      await saveActivitiesToDatabase(userProfile.userId, allActivities);

    } catch (error) {
      console.error("Error loading recent activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // ACTIVITY FETCHERS
  // ========================================
  const fetchRecentGrades = async (userId, startDate, endDate) => {
    try {
      // Fetch recent grades from all courses
      const gradeActivities = [];
      
      for (const course of courses) {
        if (course.isActive === false) continue;
        
        try {
          const [grades, categories] = await Promise.all([
            getGradesByCourseId(course.id || course.courseId),
            getAssessmentCategoriesByCourseId(course.id || course.courseId)
          ]);
          
          // Create a map of assessment_id to assessment_name
          const assessmentMap = {};
          
          // Fetch assessments for each category
          for (const category of categories) {
            try {
              const response = await fetch(`/api/assessments/category/${category.categoryId}`);
              if (response.ok) {
                const assessments = await response.json();
                assessments.forEach(assessment => {
                  assessmentMap[assessment.assessmentId || assessment.id] = assessment.assessmentName || assessment.name;
                });
              }
            } catch (error) {
              console.warn(`Failed to fetch assessments for category ${category.categoryId}:`, error);
            }
          }
          
          
          // Filter grades by date range
          const recentGrades = grades.filter(grade => {
            const gradeDate = new Date(grade.createdAt || grade.updatedAt);
            return gradeDate >= startDate && gradeDate <= endDate;
          });
          
          recentGrades.forEach(grade => {
            const pointsEarned = grade.pointsEarned;
            const pointsPossible = grade.pointsPossible;
            const isPending = pointsEarned === 0 || pointsEarned === null || pointsEarned === undefined;
            const assessmentName = assessmentMap[grade.assessmentId] || 'Assessment';
            
            
            gradeActivities.push({
              id: `grade-${grade.gradeId}`,
              type: 'grade_entry',
              title: isPending ? 'New Assessment Added' : 'Grade Added',
              description: isPending 
                ? `Upcoming ${assessmentName} in ${course.name}` 
                : `${grade.percentageScore}% in ${assessmentName}`,
              timestamp: grade.createdAt || grade.updatedAt,
              courseName: course.name,
              score: isPending ? 'Upcoming' : `${pointsEarned}/${pointsPossible}`,
              icon: 'BookOpen',
              color: isPending ? 'purple' : 'blue'
            });
          });
        } catch (error) {
          console.warn(`Failed to fetch grades for course ${course.id}:`, error);
        }
      }
      
      return gradeActivities;
    } catch (error) {
      console.error("Error fetching recent grades:", error);
      return [];
    }
  };

  const fetchRecentNotifications = async (userId, startDate, endDate) => {
    try {
      // Since there's no notifications API endpoint, we'll create mock notifications
      // based on recent activities and achievements
      const mockNotifications = [];
      
      // Add achievement notifications for recent goal completions
      const recentGoalAchievements = goals.filter(goal => {
        if (!goal.isAchieved || !goal.achievedDate) return false;
        const achievedDate = new Date(goal.achievedDate);
        return achievedDate >= startDate && achievedDate <= endDate;
      });
      
      recentGoalAchievements.forEach(goal => {
        mockNotifications.push({
          id: `notification-achievement-${goal.goalId}`,
          type: 'notification',
          title: 'Goal Achieved!',
          description: `Congratulations! You achieved your goal: ${goal.goalTitle}`,
          timestamp: goal.achievedDate,
          notificationType: 'ACHIEVEMENT',
          priority: 'HIGH',
          icon: 'Award',
          color: 'green'
        });
      });
      
      // Add grade alert notifications for recent low grades
      const recentLowGrades = [];
      for (const course of courses) {
        if (course.isActive === false) continue;
        
        try {
          const grades = await getGradesByCourseId(course.id || course.courseId);
          const recentGrades = grades.filter(grade => {
            const gradeDate = new Date(grade.createdAt || grade.updatedAt);
            return gradeDate >= startDate && gradeDate <= endDate;
          });
          
          recentGrades.forEach(grade => {
            const score = grade.percentageScore || (grade.pointsEarned / grade.pointsPossible * 100);
            if (score < 70) {
              recentLowGrades.push({
                id: `notification-grade-${grade.gradeId}`,
                type: 'notification',
                title: 'Grade Alert',
                description: `Low grade in ${course.name}: ${score.toFixed(1)}%`,
                timestamp: grade.createdAt || grade.updatedAt,
                notificationType: 'GRADE_ALERT',
                priority: 'MEDIUM',
                icon: 'AlertCircle',
                color: 'red'
              });
            }
          });
        } catch (error) {
          console.warn(`Failed to check grades for course ${course.id}:`, error);
        }
      }
      
      return [...mockNotifications, ...recentLowGrades];
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      return [];
    }
  };

  const fetchRecentGoalChanges = (goals, startDate, endDate) => {
    const goalActivities = [];
    
    goals.forEach(goal => {
      // Check for recently achieved goals
      if (goal.isAchieved && goal.achievedDate) {
        const achievedDate = new Date(goal.achievedDate);
        if (achievedDate >= startDate && achievedDate <= endDate) {
          goalActivities.push({
            id: `goal-achieved-${goal.goalId}`,
            type: 'goal_achievement',
            title: 'Goal Achieved!',
            description: `Completed ${goal.goalTitle} - ${goal.targetValue}${goal.goalType === 'COURSE_GRADE' ? '%' : ' GPA'}`,
            timestamp: goal.achievedDate,
            goalType: goal.goalType,
            icon: 'Award',
            color: 'green'
          });
        }
      }
      
      // Check for recently created goals
      if (goal.createdAt) {
        const createdDate = new Date(goal.createdAt);
        if (createdDate >= startDate && createdDate <= endDate) {
          goalActivities.push({
            id: `goal-created-${goal.goalId}`,
            type: 'goal_created',
            title: 'New Goal Set',
            description: `Set target for ${goal.goalTitle} - ${goal.targetValue}${goal.goalType === 'COURSE_GRADE' ? '%' : ' GPA'}`,
            timestamp: goal.createdAt,
            goalType: goal.goalType,
            icon: 'Target',
            color: 'purple'
          });
        }
      }
    });
    
    return goalActivities;
  };

  const fetchRecentAIAnalysis = async (userId, startDate, endDate) => {
    try {
      const aiAnalysisActivities = [];
      
      // Check for recent AI analysis for each course
      for (const course of courses) {
        if (course.isActive === false) continue;
        
        try {
          const analysisResponse = await getAIAnalysis(userId, course.id || course.courseId);
          
          if (analysisResponse.success && analysisResponse.hasAnalysis) {
            const analysis = analysisResponse.analysis;
            const createdAt = new Date(analysis.createdAt);
            const updatedAt = new Date(analysis.updatedAt);
            
            // Check if analysis was created or updated within the time range
            if ((createdAt >= startDate && createdAt <= endDate) || 
                (updatedAt >= startDate && updatedAt <= endDate)) {
              
              aiAnalysisActivities.push({
                id: `ai-analysis-${course.id}-${analysis.id}`,
                type: 'ai_analysis',
                title: 'AI Analysis Generated',
                description: `New AI insights and recommendations for ${course.name}`,
                timestamp: updatedAt > createdAt ? updatedAt : createdAt,
                courseName: course.name,
                analysisType: analysis.analysisType,
                icon: 'TrendingUp',
                color: 'indigo'
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to check AI analysis for course ${course.id}:`, error);
        }
      }
      
      return aiAnalysisActivities;
    } catch (error) {
      console.error("Error fetching recent AI analysis:", error);
      return [];
    }
  };

  // ========================================
  // DATABASE SAVING
  // ========================================
  const saveActivitiesToDatabase = async (userId, activities) => {
    try {
      // Convert activities to database format
      const activitiesToSave = activities.map(activity => ({
        userId,
        activityType: activity.type,
        context: JSON.stringify({
          title: activity.title,
          description: activity.description,
          courseName: activity.courseName,
          score: activity.score,
          goalType: activity.goalType,
          analysisType: activity.analysisType,
          notificationType: activity.notificationType,
          priority: activity.priority
        })
      }));

      // Save to database in batch
      await logUserActivities(activitiesToSave);
    } catch (error) {
      console.error("Error saving activities to database:", error);
      // Don't throw error - this shouldn't break the UI
    }
  };

  // ========================================
  // HELPER FUNCTIONS
  // ========================================
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ACHIEVEMENT': return 'Award';
      case 'GRADE_ALERT': return 'AlertCircle';
      case 'GOAL_REMINDER': return 'Target';
      case 'PREDICTION_UPDATE': return 'TrendingUp';
      case 'ASSIGNMENT_DUE': return 'Calendar';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'HIGH') return 'red';
    if (type === 'ACHIEVEMENT') return 'green';
    if (type === 'GRADE_ALERT') return 'red';
    if (type === 'GOAL_REMINDER') return 'purple';
    if (type === 'PREDICTION_UPDATE') return 'blue';
    return 'gray';
  };

  const getActivityIcon = (iconName) => {
    const icons = {
      BookOpen,
      Award,
      Target,
      Bell,
      TrendingUp,
      Calendar,
      CheckCircle,
      AlertCircle,
      Star
    };
    return icons[iconName] || Bell;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      gray: 'bg-gray-100 text-gray-700 border-gray-200',
      indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colorMap[color] || colorMap.gray;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
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
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
            <p className="text-gray-600">Your academic progress over the last {timeFilter} days</p>
          </div>
        </div>
        
        {/* Time Filter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeFilter(7)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              timeFilter === 7 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setTimeFilter(14)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              timeFilter === 14 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            14 days
          </button>
        </div>
      </div>

      {/* ========================================
          ACTIVITIES LIST
          ======================================== */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Recent Activities
          </h3>
          <p className="text-gray-500">
            Your recent academic activities will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredActivities.map((activity) => {
            const IconComponent = getActivityIcon(activity.icon);
            const colorClasses = getColorClasses(activity.color);
            
            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${colorClasses}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  
                  {/* Additional info */}
                  {activity.courseName && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {activity.courseName}
                      </span>
                    </div>
                  )}
                  
                  {activity.score && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.score === 'Upcoming' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.score === 'Upcoming' ? 'Status: Upcoming' : `Score: ${activity.score}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================
          ACTIVITY TYPE FILTER
          ======================================== */}
      {activities.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activityFilter === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActivityFilter('notification')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activityFilter === 'notification' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActivityFilter('grade_entry')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activityFilter === 'grade_entry' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Grades
            </button>
            <button
              onClick={() => setActivityFilter('goal_achievement')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activityFilter === 'goal_achievement' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActivityFilter('ai_analysis')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activityFilter === 'ai_analysis' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              AI Analysis
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          SUMMARY STATS
          ======================================== */}
      {activities.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredActivities.filter(a => a.type === 'grade_entry').length}
              </div>
              <div className="text-sm text-gray-600">Grade Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredActivities.filter(a => a.type === 'goal_achievement').length}
              </div>
              <div className="text-sm text-gray-600">Goals Achieved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredActivities.filter(a => a.type === 'goal_created').length}
              </div>
              <div className="text-sm text-gray-600">New Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredActivities.filter(a => a.type === 'notification').length}
              </div>
              <div className="text-sm text-gray-600">Notifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {filteredActivities.filter(a => a.type === 'ai_analysis').length}
              </div>
              <div className="text-sm text-gray-600">AI Analysis</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;

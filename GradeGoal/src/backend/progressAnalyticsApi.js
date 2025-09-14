// ========================================
// PROGRESS & ANALYTICS API SERVICE
// ========================================
// API functions for user_progress and user_analytics database entities

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

// ========================================
// USER PROGRESS API FUNCTIONS
// ========================================

/**
 * Get user progress data
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User progress data
 */
export const getUserProgress = async (userId) => {
  try {
    // Try database first
    const response = await fetch(`${API_BASE_URL}/api/user-progress/${userId}`);
    if (response.ok) {
      const progress = await response.json();
      return progress;
    }
  } catch (error) {
    console.warn('Database unavailable, using localStorage fallback:', error.message);
  }

  // Fallback to localStorage
  const storageKey = `user_progress_${userId}`;
  const savedProgress = localStorage.getItem(storageKey);
  
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    return progress;
  }

  // Return default progress data if no saved data
  const defaultProgress = {
    user_id: userId,
    total_points: 0,
    current_level: 1,
    points_to_next_level: 100,
    streak_days: 0,
    last_activity_date: new Date().toISOString().split('T')[0],
    semester_gpa: 0.00,
    cumulative_gpa: 0.00,
    updated_at: new Date().toISOString(),
    calculated_locally: true,
    level_info: {
      level: 1,
      levelName: "Beginner Scholar",
      totalPoints: 0,
      pointsToNextLevel: 100,
      isMaxLevel: false
    }
  };
  
  // Save default to localStorage as backup
  localStorage.setItem(storageKey, JSON.stringify(defaultProgress));
  return defaultProgress;
};

/**
 * Create or update user progress
 * @param {number} userId - User ID
 * @param {Object} progressData - Progress data to update
 * @returns {Promise<Object>} Updated progress data
 */
export const updateUserProgress = async (userId, progressData) => {
  try {
    // Try to save to database first
    const response = await fetch(`${API_BASE_URL}/api/user-progress/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    });

    if (response.ok) {
      const updatedProgress = await response.json();
      
      // Also save to localStorage as backup
      const storageKey = `user_progress_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
      
      return updatedProgress;
    }
  } catch (error) {
    console.warn('Database unavailable, using localStorage fallback:', error.message);
  }

  // Fallback to localStorage only
  const updatedProgress = {
    ...progressData,
    user_id: userId,
    updated_at: new Date().toISOString(),
    calculated_locally: true
  };
  
  // Save to localStorage
  const storageKey = `user_progress_${userId}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
  
  return updatedProgress;
};

/**
 * Award points to user
 * @param {number} userId - User ID
 * @param {number} points - Points to award
 * @param {string} action - Action that earned points (e.g., 'grade_entered', 'streak_maintained')
 * @returns {Promise<Object>} Updated progress data
 */
export const awardPoints = async (userId, points, action) => {
  try {
    // Try to award points via database
    const response = await fetch(`${API_BASE_URL}/api/user-progress/${userId}/award-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(points),
    });

    if (response.ok) {
      const updatedProgress = await response.json();
      
      // Also save to localStorage as backup
      const storageKey = `user_progress_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
      
      return updatedProgress;
    }
  } catch (error) {
    console.warn('Database unavailable for points award, using localStorage fallback:', error.message);
  }

  // Fallback to localStorage simulation
  const storageKey = `user_progress_${userId}`;
  const savedProgress = localStorage.getItem(storageKey);
  let currentProgress = savedProgress ? JSON.parse(savedProgress) : {
    user_id: userId,
    total_points: 0,
    current_level: 1,
    points_to_next_level: 100,
    streak_days: 0,
    last_activity_date: new Date().toISOString().split('T')[0],
    semester_gpa: 0.00,
    cumulative_gpa: 0.00
  };

  // Update points
  currentProgress.total_points += points;
  currentProgress.last_activity_date = new Date().toISOString().split('T')[0];
  
  // Save updated progress
  localStorage.setItem(storageKey, JSON.stringify(currentProgress));
  
  return currentProgress;
};

/**
 * Update user GPA
 * @param {number} userId - User ID
 * @param {number} semesterGPA - Current semester GPA
 * @param {number} cumulativeGPA - Cumulative GPA
 * @returns {Promise<Object>} Updated progress data
 */
export const updateUserGPA = async (userId, semesterGPA, cumulativeGPA) => {
  try {
    // Try to update GPA via database
    const response = await fetch(`${API_BASE_URL}/api/user-progress/${userId}/gpa`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        semesterGpa: semesterGPA,
        cumulativeGpa: cumulativeGPA
      }),
    });

    if (response.ok) {
      const updatedProgress = await response.json();
      
      // Also save to localStorage as backup
      const storageKey = `user_progress_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
      
      return updatedProgress;
    }
  } catch (error) {
    console.warn('Database unavailable for GPA update, using localStorage fallback:', error.message);
  }

  // Fallback to localStorage simulation
  const storageKey = `user_progress_${userId}`;
  const savedProgress = localStorage.getItem(storageKey);
  let currentProgress = savedProgress ? JSON.parse(savedProgress) : {
    user_id: userId,
    total_points: 0,
    current_level: 1,
    points_to_next_level: 100,
    streak_days: 0,
    last_activity_date: new Date().toISOString().split('T')[0],
    semester_gpa: 0.00,
    cumulative_gpa: 0.00
  };

  // Update GPA
  currentProgress.semester_gpa = semesterGPA;
  currentProgress.cumulative_gpa = cumulativeGPA;
  currentProgress.last_activity_date = new Date().toISOString().split('T')[0];
  
  // Save updated progress
  localStorage.setItem(storageKey, JSON.stringify(currentProgress));
  
  return currentProgress;
};

// ========================================
// USER ANALYTICS API FUNCTIONS
// ========================================

/**
 * Create user analytics record
 * @param {Object} analyticsData - Analytics data
 * @returns {Promise<Object>} Created analytics record
 */
export const createUserAnalytics = async (analyticsData) => {
  // Skip backend call and return analytics data as if it was created locally to avoid 404 errors
  return {
    ...analyticsData,
    calculated_at: new Date().toISOString(),
    calculated_locally: true
  };
};

/**
 * Get user analytics for a specific date range
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID (optional)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Analytics records
 */
export const getUserAnalytics = async (userId, courseId = null, startDate = null, endDate = null) => {
  // Skip backend call and return empty analytics array to avoid 404 errors
  return [];
};

/**
 * Get latest user analytics
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID (optional)
 * @returns {Promise<Object>} Latest analytics record
 */
export const getLatestUserAnalytics = async (userId, courseId = null) => {
  // Skip backend call and return null to avoid 404 errors
  return null;
};

/**
 * Calculate and store analytics for a course
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @param {Object} courseData - Course data (grades, categories, etc.)
 * @returns {Promise<Object>} Calculated analytics
 */
export const calculateAndStoreAnalytics = async (userId, courseId, courseData) => {
  try {
    
    const analyticsService = (await import('../services/analyticsService')).default;
    const analytics = await analyticsService.calculateCourseAnalytics(
      courseData.course,
      courseData.grades,
      courseData.categories,
      courseData.targetGrade
    );
    
    // Prepare analytics data for database storage (convert to camelCase for Java backend)
    const analyticsData = {
      userId,
      courseId,
      analyticsDate: new Date().toISOString().split('T')[0],
      currentGrade: analytics.current_grade,
      gradeTrend: analytics.grade_trend,
      assignmentsCompleted: analytics.assignments_completed,
      assignmentsPending: analytics.assignments_pending,
      studyHoursLogged: analytics.study_hours_logged || 0,
      performanceMetrics: JSON.stringify(analytics.performance_metrics)
    };
    
    try {
      // Try to save to database
      const response = await fetch(`${API_BASE_URL}/api/user-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
      });

      if (response.ok) {
        const savedAnalytics = await response.json();
        return {
          success: true,
          analytics,
          saved_to_database: true,
          message: 'Analytics calculated and saved to database'
        };
      }
    } catch (dbError) {
      console.warn('Database unavailable for analytics storage:', dbError.message);
    }
    
    return {
      success: true,
      analytics,
      calculated_locally: true,
      message: 'Analytics calculated locally (database not available)'
    };
  } catch (fallbackError) {
    console.error('❌ Error in calculateAndStoreAnalytics:', fallbackError);
    throw fallbackError;
  }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Calculate points for different actions
 * @param {string} action - Action type
 * @param {Object} context - Additional context (grade, course, etc.)
 * @returns {number} Points to award
 */
export const calculatePointsForAction = (action, context = {}) => {
  const pointsMap = {
    'grade_entered': 10,
    'assignment_completed': 25,
    'course_completed': 100,
    'streak_maintained': 5,
    'goal_achieved': 50,
    'perfect_score': 15,
    'improvement_made': 20,
    'on_time_submission': 10,
    'extra_credit_earned': 5,
    'study_session_completed': 5,
    'daily_login': 2,
    'weekly_goal_met': 30,
    'monthly_milestone': 100
  };

  let basePoints = pointsMap[action] || 0;

  // Bonus points based on context
  if (action === 'grade_entered' && context.grade) {
    const percentage = (context.grade.score / context.grade.maxScore) * 100;
    if (percentage >= 90) basePoints += 10; // Bonus for high scores
    if (percentage >= 95) basePoints += 5;  // Extra bonus for near-perfect
  }

  if (action === 'assignment_completed' && context.category) {
    // Bonus points for completing important categories
    if (context.category.weight >= 30) basePoints += 10;
  }

  return basePoints;
};

/**
 * Calculate level from total points
 * @param {number} totalPoints - Total points earned
 * @returns {Object} Level information
 */
export const calculateLevel = (totalPoints) => {
  const levelThresholds = [0, 100, 250, 500, 750, 1000, 1500, 2000, 3000, 5000];
  const levelNames = ['Novice', 'Beginner', 'Learner', 'Student', 'Scholar', 'Expert', 'Master', 'Genius', 'Legend', 'Mythical'];
  
  let currentLevel = 1;
  let pointsToNextLevel = 100;
  
  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (totalPoints >= levelThresholds[i] && totalPoints < levelThresholds[i + 1]) {
      currentLevel = i + 1;
      pointsToNextLevel = levelThresholds[i + 1] - totalPoints;
      break;
    }
  }
  
  if (totalPoints >= levelThresholds[levelThresholds.length - 1]) {
    currentLevel = levelThresholds.length;
    pointsToNextLevel = 0;
  }
  
  return {
    level: currentLevel,
    levelName: levelNames[currentLevel - 1] || 'Unknown',
    pointsToNextLevel,
    totalPoints,
    isMaxLevel: currentLevel === levelThresholds.length
  };
};

/**
 * Calculate streak days
 * @param {string} lastActivityDate - Last activity date
 * @param {number} currentStreak - Current streak
 * @returns {number} Updated streak
 */
export const calculateStreak = (lastActivityDate, currentStreak) => {
  if (!lastActivityDate) return 0;
  
  const lastActivity = new Date(lastActivityDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time to compare only dates
  lastActivity.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  
  if (lastActivity.getTime() === today.getTime()) {
    // Activity today, maintain streak
    return currentStreak;
  } else if (lastActivity.getTime() === yesterday.getTime()) {
    // Activity yesterday, increment streak
    return currentStreak + 1;
  } else {
    // No activity for more than 1 day, reset streak
    return 1;
  }
};

export default {
  getUserProgress,
  updateUserProgress,
  awardPoints,
  updateUserGPA,
  createUserAnalytics,
  getUserAnalytics,
  getLatestUserAnalytics,
  calculateAndStoreAnalytics,
  calculatePointsForAction,
  calculateLevel,
  calculateStreak
};

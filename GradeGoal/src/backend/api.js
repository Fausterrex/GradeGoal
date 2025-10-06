// ========================================
// MAIN API MODULE
// ========================================
// Centralized API module that imports and re-exports all API functions
// This maintains backward compatibility while organizing code into modules

// ========================================
// USER MANAGEMENT API
// ========================================
export {
  registerUser,
  loginUser,
  googleSignIn,
  facebookSignIn,
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
  updateUserPassword,
  updateUserPreferences,
  checkUsernameAvailability,
  getUserLoginStreak,
  updateUserLoginStreak
} from './userManagementAPI.js';

// ========================================
// COURSE MANAGEMENT API
// ========================================
export {
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  archiveCourse,
  unarchiveCourse,
  getCoursesByUserId,
  getCoursesByUid,
  getActiveCoursesByUid,
  getArchivedCoursesByUid,
  getAssessmentCategoriesByCourseId,
  addCategoryToCourse,
  createAssessmentCategory,
  updateAssessmentCategory,
  deleteAssessmentCategory
} from './courseManagementAPI.js';

// ========================================
// GRADE MANAGEMENT API
// ========================================
export {
  createGrade,
  getGradesByCategoryId,
  getGradesByCourseId,
  updateGrade,
  deleteGrade,
  calculateCourseGrade,
  calculateCourseGPA,
  calculateCategoryGrade,
  addOrUpdateGradeWithCalculation,
  updateCourseGrades,
  calculateGPAFromPercentage,
  calculateAndSaveCourseGrade,
  updateCourseHandleMissing,
  debugCourseCalculations
} from './gradeManagementAPI.js';

// ========================================
// ACHIEVEMENT API
// ========================================
export {
  getRecentAchievements,
  getUserProgressWithRank,
  checkAchievements,
  getUserAchievements,
  getAllAchievementsWithProgress,
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createAcademicGoal,
  getAcademicGoalsByUserId,
  getAcademicGoalsByCourse,
  getGoalsByAchievementStatus,
  logUserActivity,
  logUserActivities,
  getRecentUserActivities,
  getUserActivityStats,
  awardPoints,
  checkGoalProgress,
  checkGradeAlerts
} from './achievementAPI.js';

// ========================================
// AI ANALYSIS API
// ========================================
export {
  saveAIAnalysis,
  getAIRecommendations,
  getAIRecommendationsForCourse,
  markRecommendationAsRead,
  dismissRecommendation,
  getAIAnalysis,
  checkAIAnalysisExists,
  saveAIAssessmentPrediction,
  getAIAssessmentPredictions
} from './aiAnalysisAPI.js';

// ========================================
// LEGACY GOAL FUNCTIONS (for backward compatibility)
// ========================================

/**
 * Create goal (legacy function - redirects to academic goals)
 * @param {Object} goalData - Goal data
 * @returns {Promise<Object>} Created goal data
 */
export async function createGoal(goalData) {
  // Import the academic goal function
  const { createAcademicGoal } = await import('./achievementAPI.js');
  return createAcademicGoal(goalData);
}

/**
 * Get goals by UID (legacy function - redirects to academic goals)
 * @param {string} uid - User email/UID
 * @returns {Promise<Array>} Array of goals
 */
export async function getGoalsByUid(uid) {
  // Import the academic goal function
  const { getAcademicGoalsByUserId } = await import('./achievementAPI.js');
  
  // First get user profile to get userId
  const { getUserProfile } = await import('./userManagementAPI.js');
  const user = await getUserProfile(uid);
  
  return getAcademicGoalsByUserId(user.userId);
}

/**
 * Update goal (legacy function - not implemented)
 * @param {number} id - Goal ID
 * @param {Object} goalData - Updated goal data
 * @returns {Promise<Object>} Updated goal data
 */
export async function updateGoal(id, goalData) {
  // This function is not implemented in the new structure
  // Academic goals are automatically managed based on course completion
  throw new Error("Goal updates are not supported. Goals are automatically managed based on course completion.");
}

/**
 * Delete goal (legacy function - not implemented)
 * @param {number} id - Goal ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteGoal(id) {
  // This function is not implemented in the new structure
  // Academic goals are automatically managed based on course completion
  throw new Error("Goal deletion is not supported. Goals are automatically managed based on course completion.");
}

// ========================================
// API BASE URL (for external use if needed)
// ========================================
export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");
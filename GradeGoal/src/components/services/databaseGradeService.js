// ========================================
// DATABASE GRADE SERVICE
// ========================================
// Service for interfacing with database grade calculation functions
// This service calls MySQL stored procedures and functions for grade calculations

import axios from "axios";
// Base API URL - adjust according to your Spring Boot backend URL
const API_BASE_URL = 'http://localhost:8080/api';

class DatabaseGradeService {
  
  /**
   * Calculate GPA from percentage using database function
   * Calls MySQL function: CalculateGPA(percentage)
   * @param {number} percentage - The percentage score (0-100)
   * @returns {Promise<number>} - GPA value (0.00-4.00)
   */
  static async calculateGPA(percentage) {
    try {
      const response = await axios.post(`${API_BASE_URL}/grades/calculate-gpa`, {
        percentage: percentage
      });
      return response.data.gpa || 0.00;
    } catch (error) {
      console.error('Error calculating GPA:', error);
      return 0.00;
    }
  }

  /**
   * Calculate cumulative GPA for a user using database function
   * Calls MySQL function: CalculateCumulativeGPA(user_id)
   * @param {number} userId - The user ID
   * @returns {Promise<number>} - Cumulative GPA value (0.00-4.00)
   */
  static async calculateCumulativeGPA(userId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/grades/calculate-cumulative-gpa`, {
        userId: userId
      });
      return response.data.cumulativeGPA || 0.00;
    } catch (error) {
      console.error('Error calculating cumulative GPA:', error);
      return 0.00;
    }
  }

  /**
   * Calculate course grade using database function
   * Calls MySQL function: CalculateCourseGrade(course_id)
   * @param {number} courseId - The course ID
   * @returns {Promise<number>} - Course grade percentage (0.00-100.00)
   */
  static async calculateCourseGrade(courseId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/grades/calculate-course-grade`, {
        courseId: courseId
      });
      return response.data.courseGrade || 0.00;
    } catch (error) {
      console.error('Error calculating course grade:', error);
      return 0.00;
    }
  }

  /**
   * Calculate category grade using database function
   * Calls MySQL function: CalculateCategoryGrade(category_id)
   * @param {number} categoryId - The assessment category ID
   * @returns {Promise<number>} - Category grade percentage (0.00-100.00)
   */
  static async calculateCategoryGrade(categoryId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/grades/calculate-category-grade`, {
        categoryId: categoryId
      });
      return response.data.categoryGrade || 0.00;
    } catch (error) {
      console.error('Error calculating category grade:', error);
      return 0.00;
    }
  }

  /**
   * Add or update a grade using database stored procedure
   * Calls MySQL procedure: AddOrUpdateGrade(...)
   * @param {Object} gradeData - Grade data object
   * @returns {Promise<Object>} - Result object with success status and grade ID
   */
  static async addOrUpdateGrade(gradeData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/grades/add-or-update`, gradeData);
      return {
        success: true,
        gradeId: response.data.gradeId,
        result: response.data.result
      };
    } catch (error) {
      console.error('Error adding/updating grade:', error);
      return {
        success: false,
        gradeId: null,
        result: 'Failed to add/update grade'
      };
    }
  }

  /**
   * Update course grades using database stored procedure
   * Calls MySQL procedure: UpdateCourseGrades(course_id)
   * @param {number} courseId - The course ID
   * @returns {Promise<boolean>} - Success status
   */
  static async updateCourseGrades(courseId) {
    try {
      await axios.post(`${API_BASE_URL}/grades/update-course-grades`, {
        courseId: courseId
      });
      return true;
    } catch (error) {
      console.error('Error updating course grades:', error);
      return false;
    }
  }

  /**
   * Award points to user using database stored procedure
   * Calls MySQL procedure: AwardPoints(user_id, points, activity_type)
   * @param {number} userId - The user ID
   * @param {number} points - Points to award
   * @param {string} activityType - Type of activity (e.g., 'GRADE_ADDED')
   * @returns {Promise<boolean>} - Success status
   */
  static async awardPoints(userId, points, activityType) {
    try {
      await axios.post(`${API_BASE_URL}/progress/award-points`, {
        userId: userId,
        points: points,
        activityType: activityType
      });
      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      return false;
    }
  }

  /**
   * Check goal progress using database stored procedure
   * Calls MySQL procedure: CheckGoalProgress(user_id)
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} - Success status
   */
  static async checkGoalProgress(userId) {
    try {
      await axios.post(`${API_BASE_URL}/goals/check-progress`, {
        userId: userId
      });
      return true;
    } catch (error) {
      console.error('Error checking goal progress:', error);
      return false;
    }
  }

  /**
   * Check grade alerts using database stored procedure
   * Calls MySQL procedure: CheckGradeAlerts(user_id)
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} - Success status
   */
  static async checkGradeAlerts(userId) {
    try {
      await axios.post(`${API_BASE_URL}/alerts/check-grade-alerts`, {
        userId: userId
      });
      return true;
    } catch (error) {
      console.error('Error checking grade alerts:', error);
      return false;
    }
  }

  /**
   * Check user achievements using database stored procedure
   * Calls MySQL procedure: CheckUserAchievements(user_id)
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} - Success status
   */
  static async checkUserAchievements(userId) {
    try {
      await axios.post(`${API_BASE_URL}/achievements/check-user-achievements`, {
        userId: userId
      });
      return true;
    } catch (error) {
      console.error('Error checking user achievements:', error);
      return false;
    }
  }

  /**
   * Update user analytics using database stored procedure
   * Calls MySQL procedure: UpdateUserAnalytics(user_id, course_id)
   * @param {number} userId - The user ID
   * @param {number} courseId - The course ID (optional)
   * @returns {Promise<boolean>} - Success status
   */
  static async updateUserAnalytics(userId, courseId = null) {
    try {
      await axios.post(`${API_BASE_URL}/analytics/update-user-analytics`, {
        userId: userId,
        courseId: courseId
      });
      return true;
    } catch (error) {
      console.error('Error updating user analytics:', error);
      return false;
    }
  }

  /**
   * Batch calculate grades for multiple courses
   * @param {number} userId - The user ID
   * @param {Array<number>} courseIds - Array of course IDs
   * @returns {Promise<Object>} - Object with course grades
   */
  static async batchCalculateCourseGrades(userId, courseIds) {
    try {
      const results = {};
      
      // Calculate grades for each course in parallel
      const promises = courseIds.map(async (courseId) => {
        const grade = await this.calculateCourseGrade(courseId);
        results[courseId] = grade;
        return { courseId, grade };
      });

      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error batch calculating course grades:', error);
      return {};
    }
  }

  /**
   * Batch calculate category grades for a course
   * @param {Array<number>} categoryIds - Array of category IDs
   * @returns {Promise<Object>} - Object with category grades
   */
  static async batchCalculateCategoryGrades(categoryIds) {
    try {
      const results = {};
      
      // Calculate grades for each category in parallel
      const promises = categoryIds.map(async (categoryId) => {
        const grade = await this.calculateCategoryGrade(categoryId);
        results[categoryId] = grade;
        return { categoryId, grade };
      });

      await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error batch calculating category grades:', error);
      return {};
    }
  }
}

export default DatabaseGradeService;

// Named exports for individual functions
export const {
  calculateGPA,
  calculateCumulativeGPA,
  calculateCourseGrade,
  calculateCategoryGrade,
  addOrUpdateGrade,
  updateCourseGrades,
  awardPoints,
  checkGoalProgress,
  checkGradeAlerts,
  checkUserAchievements,
  updateUserAnalytics,
  batchCalculateCourseGrades,
  batchCalculateCategoryGrades
} = DatabaseGradeService;


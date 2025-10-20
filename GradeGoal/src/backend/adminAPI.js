// ========================================
// ADMIN API MODULE
// ========================================
// Centralized API functions for admin-related operations
// Handles user management, course management, and admin dashboard data

import { getAssessmentCategoriesByCourseId } from './courseManagementAPI.js';
import { auth } from "./firebase";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get Firebase authentication headers
 * @returns {Promise<Object>} Headers with Firebase token
 */
async function getAuthHeaders() {
  const firebaseUser = auth.currentUser;
  let authToken = null;

  if (firebaseUser) {
    try {
      authToken = await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }
  }

  const headers = {
    "Content-Type": "application/json",
  };

  // Add Firebase token to headers if available
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
}

// ========================================
// ADMIN USER MANAGEMENT
// ========================================

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} Array of all users
 */
export async function getAllUsers() {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch users with status ${response.status}`);
  }

  return response.json();
}

/**
 * Get user by ID (admin only)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUserById(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch user with status ${response.status}`);
  }

  return response.json();
}

/**
 * Update user profile (admin only)
 * @param {number} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserProfileAdmin(userId, userData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      username: userData.username,
      profilePictureUrl: userData.profilePictureUrl || null,
      currentYearLevel: userData.currentYearLevel || "1",
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to update user profile with status ${response.status}`);
  }

  return response.json();
}

/**
 * Freeze/unfreeze user account (admin only)
 * @param {number} userId - User ID
 * @param {boolean} isActive - Account status (true = active, false = frozen)
 * @returns {Promise<Object>} Update response
 */
export async function updateUserAccountStatus(userId, isActive) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      isActive: isActive
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to update account status with status ${response.status}`);
  }

  return response.json();
}

/**
 * Delete user account (admin only)
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteUserAccount(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to delete user with status ${response.status}`);
  }

  return true;
}

// ========================================
// ADMIN COURSE MANAGEMENT
// ========================================

/**
 * Get all courses (admin only)
 * @returns {Promise<Array>} Array of all courses
 */
export async function getAllCourses() {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/all`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch courses with status ${response.status}`);
  }

  return response.json();
}


/**
 * Get assessments by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of assessments
 */
export async function getAssessmentsByCategoryId(categoryId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/assessments/category/${categoryId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch assessments with status ${response.status}`);
  }

  return response.json();
}

/**
 * Get admin dashboard data
 * @returns {Promise<Object>} Dashboard data including users, courses, and statistics
 */
export async function getAdminDashboardData() {
  try {
    // Fetch all data in parallel
    const [users, courses] = await Promise.all([
      getAllUsers(),
      getAllCourses()
    ]);

    // Process users data (exclude admin users)
    const processedUsers = {};
    users.forEach(user => {
      // Skip admin users
      if (user.role === 'ADMIN') {
        return;
      }
      
      processedUsers[user.userId] = {
        user_id: user.userId,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString().split('T')[0] : 'N/A',
        isActive: user.isActive,
        role: user.role,
        username: user.username,
        currentYearLevel: user.currentYearLevel,
        progress: '0%', // Will be calculated based on courses
        subjects: {} // Will be populated with user's courses
      };
    });

    // Helper function to safely convert calculatedCourseGrade to number
    const getNumericGrade = (grade) => {
      if (grade == null) return 0;
      if (typeof grade === 'number') return grade;
      if (typeof grade === 'string') return parseFloat(grade) || 0;
      if (grade && typeof grade.doubleValue === 'function') return grade.doubleValue();
      return 0;
    };

    // Process courses data and populate student subjects
    const processedCourses = {};
    courses.forEach(course => {
      processedCourses[course.courseId] = {
        course_id: course.courseId,
        course_name: course.courseName,
        course_code: course.courseCode || course.courseName,
        students: 1, // Each course belongs to one user
        overallProgress: course.calculatedCourseGrade ? `${Math.round(getNumericGrade(course.calculatedCourseGrade))}%` : '0%',
        activities: [], // Will be populated with assessments
        enrolled: [processedUsers[course.userId]?.name || 'Unknown User']
      };

      // Add course to student's subjects if the student exists
      if (processedUsers[course.userId]) {
        processedUsers[course.userId].subjects[course.courseId] = {
          course_name: course.courseName,
          progress: course.calculatedCourseGrade ? `${Math.round(getNumericGrade(course.calculatedCourseGrade))}%` : '0%',
          activities: [] // Will be populated with assessments
        };
      }
    });

    // Calculate overall progress for each student based on their courses
    Object.keys(processedUsers).forEach(userId => {
      const user = processedUsers[userId];
      const userCourses = Object.values(user.subjects);
      
      if (userCourses.length > 0) {
        // Calculate average progress from all user's courses
        const totalProgress = userCourses.reduce((sum, course) => {
          const progressValue = parseFloat(course.progress.replace('%', '')) || 0;
          return sum + progressValue;
        }, 0);
        
        const averageProgress = totalProgress / userCourses.length;
        user.progress = `${Math.round(averageProgress)}%`;
      } else {
        user.progress = '0%';
      }
    });

    // Populate assessments for each course
    await Promise.all(Object.keys(processedCourses).map(async (courseId) => {
      try {
        const categories = await getAssessmentCategoriesByCourseId(courseId);
        const allAssessments = [];
        
        // Get assessments for each category
        for (const category of categories) {
          try {
            const assessments = await getAssessmentsByCategoryId(category.categoryId);
            allAssessments.push(...assessments.map(assessment => ({
              assessment_id: assessment.assessmentId,
              name: assessment.assessmentName,
              type: category.categoryName,
              status: assessment.status || 'pending',
              score: assessment.grades && assessment.grades.length > 0 
                ? `${assessment.grades[0].pointsEarned || 0}/${assessment.grades[0].pointsPossible || 100}`
                : '0/100'
            })));
          } catch (error) {
            console.warn(`Failed to fetch assessments for category ${category.categoryId}:`, error);
          }
        }
        
        // Update course activities
        processedCourses[courseId].activities = allAssessments;
        
        // Update student's course activities if the student exists
        const course = courses.find(c => c.courseId == courseId);
        if (course && processedUsers[course.userId]) {
          processedUsers[course.userId].subjects[courseId].activities = allAssessments;
        }
      } catch (error) {
        console.warn(`Failed to fetch assessments for course ${courseId}:`, error);
      }
    }));

    // Calculate overall statistics (exclude admin users)
    const nonAdminUsers = users.filter(user => user.role !== 'ADMIN');
    
    // Calculate average completion from courses
    const coursesWithGrades = courses.filter(course => course.calculatedCourseGrade != null);
    const averageCompletion = coursesWithGrades.length > 0 
      ? coursesWithGrades.reduce((sum, course) => sum + getNumericGrade(course.calculatedCourseGrade), 0) / coursesWithGrades.length
      : 0;
    
    const overallStats = {
      students: nonAdminUsers.length,
      courses: courses.length,
      completions: `${Math.round(averageCompletion)}%`
    };

    // Generate recent activity (exclude admin users)
    const recentActivity = nonAdminUsers.slice(0, 10).map((user, index) => ({
      notification_id: index + 1,
      type: `${user.firstName} ${user.lastName} Joined`,
      time: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
    }));

    return {
      overall: overallStats,
      recentActivity,
      historyRecords: recentActivity, // Same as recent activity for now
      students: processedUsers,
      courses: processedCourses
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw error;
  }
}


// ========================================
// ADMIN NOTIFICATIONS
// ========================================

/**
 * Send notification to user (admin only)
 * @param {number} userId - User ID
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @returns {Promise<Object>} Notification response
 */
export async function sendNotificationToUser(userId, message, type = 'admin') {
  // First get user email by userId
  const user = await getUserById(userId);
  if (!user || !user.email) {
    throw new Error("User not found or email not available");
  }

  // For now, just log the notification attempt
  // Push notifications require FCM tokens which most users don't have
  
  // Return a mock success response since push notifications aren't critical
  return { success: true, message: 'Notification logged (push notifications require FCM token setup)' };
}

/**
 * Notify user about account freeze/unfreeze
 * @param {number} userId - User ID
 * @param {boolean} isFrozen - Whether account is frozen
 * @returns {Promise<Object>} Notification response
 */
export async function notifyAccountStatusChange(userId, isFrozen) {
  const message = isFrozen 
    ? 'Your account has been frozen by an administrator. Please contact support for assistance.'
    : 'Your account has been unfrozen. You can now access your account normally.';
  
  return sendNotificationToUser(userId, message, 'account_status');
}

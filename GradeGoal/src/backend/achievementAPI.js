// ========================================
// ACHIEVEMENT API
// ========================================
// Centralized API functions for achievement-related operations
// Handles achievements, notifications, goals, and user progress

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
// ACHIEVEMENT OPERATIONS
// ========================================

/**
 * Get user's recent achievements (limited to 2 most recent)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Recent achievements data
 */
export async function getRecentAchievements(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/user-progress/${userId}/recent-achievements`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get recent achievements with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Get user progress with rank information
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User progress with rank data
 */
export async function getUserProgressWithRank(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/user-progress/${userId}/with-rank`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get user progress with rank with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Check and award achievements for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Achievement check result
 */
export async function checkAchievements(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/check/${userId}`,
    {
      method: "POST",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to check achievements with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get all achievements for a user (earned)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User achievements data
 */
export async function getUserAchievements(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/user/${userId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get user achievements with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get all achievements with progress (locked and unlocked)
 * @param {number} userId - User ID
 * @returns {Promise<Object>} All achievements with progress data
 */
export async function getAllAchievementsWithProgress(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/user/${userId}/all`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get all achievements with status ${response.status}`);
  }
  
  return response.json();
}

// ========================================
// NOTIFICATION OPERATIONS
// ========================================

/**
 * Get notifications for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User notifications data
 */
export async function getNotifications(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get notifications with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get unread notifications for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Unread notifications data
 */
export async function getUnreadNotifications(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}/unread`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get unread notifications with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get unread notification count
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Unread count data
 */
export async function getUnreadCount(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}/unread-count`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get unread count with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Mark as read result
 */
export async function markNotificationAsRead(notificationId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to mark notification as read with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Mark all notifications as read for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Mark all as read result
 */
export async function markAllNotificationsAsRead(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/achievements/notifications/${userId}/mark-all-read`,
    {
      method: "PUT",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to mark all notifications as read with status ${response.status}`);
  }
  
  return response.json();
}

// ========================================
// ACADEMIC GOALS
// ========================================

/**
 * Create academic goal
 * @param {Object} goalData - Goal data
 * @returns {Promise<Object>} Created goal data
 */
export async function createAcademicGoal(goalData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/academic-goals`, {
    method: "POST",
    headers,
    body: JSON.stringify(goalData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create goal with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get academic goals by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of academic goals
 */
export async function getAcademicGoalsByUserId(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/academic-goals/user/${userId}`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch goals with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get academic goals by course
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} Array of course-specific goals
 */
export async function getAcademicGoalsByCourse(userId, courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/academic-goals/user/${userId}/course/${courseId}`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch course goals with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get academic goals by achievement status
 * @param {number} userId - User ID
 * @param {boolean} isAchieved - Achievement status filter
 * @returns {Promise<Array>} Array of goals filtered by achievement status
 */
export async function getGoalsByAchievementStatus(userId, isAchieved) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/academic-goals/user/${userId}/achievement-status?isAchieved=${isAchieved}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get goals by achievement status with status ${response.status}`);
  }
  
  return response.json();
}

// ========================================
// USER ACTIVITY LOG
// ========================================

/**
 * Save a single activity to the database
 * @param {number} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {Object} context - Activity context
 * @param {string} ipAddress - IP address (optional)
 * @returns {Promise<Object>} Activity log result
 */
export async function logUserActivity(userId, activityType, context, ipAddress = null) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/user-activity/log`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userId,
      activityType,
      context,
      ipAddress
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to log activity with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Save multiple activities to the database in batch
 * @param {Array} activities - Array of activity objects
 * @returns {Promise<Object>} Batch activity log result
 */
export async function logUserActivities(activities) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/user-activity/log-batch`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      activities
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to log activities with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get recent activities for a user
 * @param {number} userId - User ID
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Object>} Recent activities data
 */
export async function getRecentUserActivities(userId, days = 7) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/user-activity/user/${userId}/recent?days=${days}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get recent activities with status ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get activity statistics for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Activity statistics data
 */
export async function getUserActivityStats(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/user-activity/user/${userId}/stats`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to get activity stats with status ${response.status}`);
  }
  
  return response.json();
}

// ========================================
// POINTS AND PROGRESS
// ========================================

/**
 * Award points to a user
 * @param {number} userId - User ID
 * @param {number} points - Points to award
 * @param {string} activityType - Type of activity
 * @returns {Promise<Object>} Points award result
 */
export async function awardPoints(userId, points, activityType) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/user/${userId}/award-points`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ points, activityType }),
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to award points with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Check goal progress for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Goal progress check result
 */
export async function checkGoalProgress(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/user/${userId}/check-goal-progress`,
    {
      method: "POST",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to check goal progress with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Check grade alerts for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Grade alerts check result
 */
export async function checkGradeAlerts(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/user/${userId}/check-grade-alerts`,
    {
      method: "POST",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to check grade alerts with status ${response.status}`
    );
  }
  
  return response.json();
}

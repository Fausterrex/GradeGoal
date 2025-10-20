// ========================================
// COURSE MANAGEMENT API
// ========================================
// Centralized API functions for course-related operations
// Handles course CRUD operations, categories, and course data

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
// COURSE CRUD OPERATIONS
// ========================================

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @returns {Promise<Object>} Created course data
 */
export async function createCourse(courseData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: "POST",
    headers,
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create course with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get course by ID
 * @param {number} id - Course ID
 * @returns {Promise<Object>} Course data
 */
export async function getCourseById(id) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get course with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Update course
 * @param {number} id - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course data
 */
export async function updateCourse(id, courseData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update course with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Delete course
 * @param {number} id - Course ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteCourse(id) {
  console.log('🗑️ [API] Attempting to delete course with id:', id);
  
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: "DELETE",
    headers,
  });
  
  console.log('🗑️ [API] Delete course response status:', response.status);
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error('🗑️ [API] Delete course error:', text);
    
    if (response.status === 404) {
      throw new Error("Course not found or already deleted");
    } else if (response.status === 500) {
      throw new Error(`Server error: ${text || "Unable to delete course"}`);
    } else {
      throw new Error(
        text || `Failed to delete course with status ${response.status}`
      );
    }
  }
  
  console.log('🗑️ [API] Course deleted successfully');
  return true;
}

// ========================================
// COURSE ARCHIVING
// ========================================

/**
 * Archive course
 * @param {number} id - Course ID
 * @returns {Promise<Object>} Archived course data
 */
export async function archiveCourse(id) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/archive`, {
    method: "PUT",
    headers,
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to archive course with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Unarchive course
 * @param {number} id - Course ID
 * @returns {Promise<Object>} Unarchived course data
 */
export async function unarchiveCourse(id) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/unarchive`, {
    method: "PUT",
    headers,
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to unarchive course with status ${response.status}`
    );
  }
  
  return response.json();
}

// ========================================
// COURSE QUERIES
// ========================================

/**
 * Get courses by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of courses
 */
export async function getCoursesByUserId(userId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${userId}`, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch courses with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get courses by user email/UID
 * @param {string} email - User email/UID
 * @returns {Promise<Array>} Array of courses
 */
export async function getCoursesByUid(email) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/courses/user/${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch courses with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get active courses by user email/UID
 * @param {string} uid - User email/UID
 * @returns {Promise<Array>} Array of active courses
 */
export async function getActiveCoursesByUid(uid) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/active`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch active courses with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get archived courses by user email/UID
 * @param {string} uid - User email/UID
 * @returns {Promise<Array>} Array of archived courses
 */
export async function getArchivedCoursesByUid(uid) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/archived`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch archived courses with status ${response.status}`
    );
  }
  
  return response.json();
}

// ========================================
// ASSESSMENT CATEGORIES
// ========================================

/**
 * Get assessment categories by course ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} Array of assessment categories
 */
export async function getAssessmentCategoriesByCourseId(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/categories`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text ||
        `Failed to fetch assessment categories with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Add category to course
 * @param {number} courseId - Course ID
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category data
 */
export async function addCategoryToCourse(courseId, categoryData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/categories`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(categoryData),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to add category with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Create assessment category
 * @param {number} courseId - Course ID
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>} Created category data
 */
export async function createAssessmentCategory(courseId, categoryData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/courses/${courseId}/categories`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(categoryData),
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text ||
        `Failed to create assessment category with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Update assessment category
 * @param {number} categoryId - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise<Object>} Updated category data
 */
export async function updateAssessmentCategory(categoryId, categoryData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/assessment-categories/${categoryId}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(categoryData),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update category with status ${response.status}`
    );
  }

  return response.json();
}

/**
 * Delete assessment category
 * @param {number} categoryId - Category ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteAssessmentCategory(categoryId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/assessment-categories/${categoryId}`,
    {
      method: "DELETE",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete category with status ${response.status}`
    );
  }

  return response.ok;
}

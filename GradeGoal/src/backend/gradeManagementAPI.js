// ========================================
// GRADE MANAGEMENT API
// ========================================
// Centralized API functions for grade-related operations
// Handles grade CRUD operations, calculations, and grade data

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
// GRADE CRUD OPERATIONS
// ========================================

/**
 * Create a new grade
 * @param {Object} gradeData - Grade data
 * @returns {Promise<Object>} Created grade data
 */
export async function createGrade(gradeData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: "POST",
    headers,
    body: JSON.stringify(gradeData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to create grade with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get grades by category ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Array>} Array of grades
 */
export async function getGradesByCategoryId(categoryId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/grades/category/${categoryId}`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch grades with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get grades by course ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} Array of grades
 */
export async function getGradesByCourseId(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/grades/course/${courseId}`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch grades with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Update grade
 * @param {number} id - Grade ID
 * @param {Object} gradeData - Updated grade data
 * @returns {Promise<Object>} Updated grade data
 */
export async function updateGrade(id, gradeData) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(gradeData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update grade with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Delete grade
 * @param {number} id - Grade ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteGrade(id) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: "DELETE",
    headers,
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to delete grade with status ${response.status}`
    );
  }
  
  return response.ok;
}

// ========================================
// GRADE CALCULATIONS
// ========================================

/**
 * Calculate course grade
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course grade calculation result
 */
export async function calculateCourseGrade(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/grade`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate course grade with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Calculate course GPA
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course GPA calculation result
 */
export async function calculateCourseGPA(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/gpa`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate course GPA with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Calculate category grade
 * @param {number} categoryId - Category ID
 * @param {string} semesterTerm - Semester term (default: "MIDTERM")
 * @returns {Promise<Object>} Category grade calculation result
 */
export async function calculateCategoryGrade(categoryId, semesterTerm = "MIDTERM") {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/grades/calculate-category-grade`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        categoryId: categoryId,
        semesterTerm: semesterTerm
      }),
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate category grade with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Add or update grade with calculation
 * @param {Object} gradeData - Grade data with calculation
 * @returns {Promise<Object>} Grade update result
 */
export async function addOrUpdateGradeWithCalculation(gradeData) {
  // Validate required fields before sending
  const requiredFields = ['assessmentId', 'pointsEarned', 'pointsPossible', 'percentageScore'];
  const missingFields = requiredFields.filter(field => gradeData[field] === null || gradeData[field] === undefined);
  
  if (missingFields.length > 0) {
    console.error("Missing required fields:", missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/grade/add-update`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(gradeData),
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("API Error Response:", text);
    throw new Error(
      text || `Failed to add/update grade with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Update course grades
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course grades update result
 */
export async function updateCourseGrades(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/update-grades`,
    {
      method: "POST",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update course grades with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Calculate GPA from percentage
 * @param {number} percentage - Percentage score
 * @returns {Promise<Object>} GPA calculation result
 */
export async function calculateGPAFromPercentage(percentage) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/gpa/calculate`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ percentage }),
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate GPA with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Calculate and save course grade
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course grade calculation and save result
 */
export async function calculateAndSaveCourseGrade(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/calculate-and-save`,
    {
      method: "POST",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to calculate and save course grade with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Update course handle missing setting
 * @param {number} courseId - Course ID
 * @param {boolean} handleMissing - Handle missing grades setting
 * @returns {Promise<Object>} Update result
 */
export async function updateCourseHandleMissing(courseId, handleMissing) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/handle-missing`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ handleMissing }),
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to update handle missing setting with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Debug course calculations
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Debug information
 */
export async function debugCourseCalculations(courseId) {
  const headers = await getAuthHeaders();
  
  const response = await fetch(
    `${API_BASE_URL}/api/database-calculations/course/${courseId}/debug`,
    {
      method: "GET",
      headers,
    }
  );
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to debug course calculations with status ${response.status}`
    );
  }
  
  return response.json();
}

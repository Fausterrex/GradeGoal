
/**
 * API Configuration
 * Base URL for the Spring Boot backend API
 */
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080');

/**
 * User Registration API
 * 
 * Creates a new user account in the backend system.
 * Integrates with Firebase Authentication for user management.
 * 
 * @param {Object} userPayload - User registration data
 * @param {string} userPayload.uid - Firebase UID
 * @param {string} userPayload.email - User's email address
 * @param {string} userPayload.displayName - User's display name
 * @returns {Promise<Object>} Response from the backend
 * @throws {Error} If registration fails
 */
export async function registerUser(userPayload) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userPayload),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Signup failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

/**
 * User Login API
 * 
 * Retrieves user data from the backend using Firebase UID.
 * Used to fetch user profile and preferences after Firebase authentication.
 * 
 * @param {string} uid - Firebase UID for the authenticated user
 * @returns {Promise<Object>} User data from the backend
 * @throws {Error} If login fails
 */
export async function loginUser(uid) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Login failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

/**
 * Google Sign-In API
 * 
 * Handles Google authentication and creates/updates user in backend.
 * Called after successful Google sign-in through Firebase.
 * 
 * @param {Object} userData - User data from Google authentication
 * @param {string} userData.uid - Firebase UID
 * @param {string} userData.email - User's email address
 * @param {string} userData.displayName - User's display name
 * @returns {Promise<Object>} Response from the backend
 * @throws {Error} If Google sign-in fails
 */
export async function googleSignIn(userData) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal/google-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Google sign-in failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

/**
 * Facebook Sign-In API
 * 
 * Handles Facebook authentication and creates/updates user in backend.
 * Called after successful Facebook sign-in through Firebase.
 * 
 * @param {Object} userData - User data from Facebook authentication
 * @param {string} userData.uid - Firebase UID
 * @param {string} userData.email - User's email address
 * @param {string} userData.displayName - User's display name
 * @returns {Promise<Object>} Response from the backend
 * @throws {Error} If Facebook sign-in fails
 */
export async function facebookSignIn(userData) {
  const response = await fetch(`${API_BASE_URL}/api/gradeGoal/facebook-signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Facebook sign-in failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

// Course API functions

/**
 * Create Course API
 * 
 * Creates a new course in the backend database.
 * Includes course details, grading scale, and initial categories.
 * 
 * @param {Object} courseData - Course creation data
 * @param {string} courseData.uid - User ID who owns the course
 * @param {string} courseData.name - Course name
 * @param {string} courseData.courseCode - Course code (e.g., CS101)
 * @param {string} courseData.gradingScale - Grading scale (percentage, gpa, points)
 * @param {number} courseData.maxPoints - Maximum points for the course
 * @param {string} courseData.gpaScale - GPA scale (4.0, 5.0, etc.)
 * @param {string} courseData.termSystem - Term system (3-term, 4-term)
 * @param {string} courseData.targetGrade - Target grade for the course
 * @param {number} courseData.colorIndex - Color index for course display
 * @returns {Promise<Object>} Created course object
 * @throws {Error} If course creation fails
 */
export async function createCourse(courseData) {
  const response = await fetch(`${API_BASE_URL}/api/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create course with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Courses by User ID API
 * 
 * Retrieves all courses belonging to a specific user.
 * Returns courses ordered by creation date (newest first).
 * 
 * @param {string} uid - Firebase UID of the user
 * @returns {Promise<Array>} Array of course objects
 * @throws {Error} If fetching courses fails
 */
export async function getCoursesByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch courses with status ${response.status}`);
  }
  return response.json();
}

/**
 * Update Course API
 * 
 * Updates an existing course with new information.
 * Preserves creation timestamp and updates modification timestamp.
 * 
 * @param {number} id - Course ID to update
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course object
 * @throws {Error} If course update fails
 */
export async function updateCourse(id, courseData) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update course with status ${response.status}`);
  }
  return response.json();
}

/**
 * Delete Course API
 * 
 * Permanently removes a course and all associated data.
 * This action cannot be undone.
 * 
 * @param {number} id - Course ID to delete
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} If course deletion fails
 */
export async function deleteCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete course with status ${response.status}`);
  }
  return response.ok;
}

/**
 * Archive Course API
 * 
 * Archives a course without permanent deletion.
 * Archived courses are hidden from the main view but can be restored.
 * 
 * @param {number} id - Course ID to archive
 * @returns {Promise<Object>} Archived course object
 * @throws {Error} If archiving fails
 */
export async function archiveCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/archive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to archive course with status ${response.status}`);
  }
  return response.json();
}

/**
 * Unarchive Course API
 * 
 * Restores an archived course to active status.
 * Makes the course visible again in the main interface.
 * 
 * @param {number} id - Course ID to unarchive
 * @returns {Promise<Object>} Unarchived course object
 * @throws {Error} If unarchiving fails
 */
export async function unarchiveCourse(id) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${id}/unarchive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to unarchive course with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Active Courses by User ID API
 * 
 * Retrieves only active (non-archived) courses for a user.
 * Used for the main dashboard display.
 * 
 * @param {string} uid - Firebase UID of the user
 * @returns {Promise<Array>} Array of active course objects
 * @throws {Error} If fetching active courses fails
 */
export async function getActiveCoursesByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/active`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch active courses with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Archived Courses by User ID API
 * 
 * Retrieves only archived courses for a user.
 * Used for the archived courses view.
 * 
 * @param {string} uid - Firebase UID of the user
 * @returns {Promise<Array>} Array of archived course objects
 * @throws {Error} If fetching archived courses fails
 */
export async function getArchivedCoursesByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/courses/user/${encodeURIComponent(uid)}/archived`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch archived courses with status ${response.status}`);
  }
  return response.json();
}

/**
 * Add Category to Course API
 * 
 * Creates a new category within an existing course.
 * Categories define the grading structure and weights for the course.
 * 
 * @param {number} courseId - Course ID to add the category to
 * @param {Object} categoryData - Category creation data
 * @param {string} categoryData.name - Category name (e.g., "Assignments", "Exams")
 * @param {number} categoryData.weight - Category weight percentage
 * @returns {Promise<Object>} Created category object
 * @throws {Error} If category creation fails
 */
export async function addCategoryToCourse(courseId, categoryData) {
  const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to add category with status ${response.status}`);
  }
  
  return response.json();
}

// Grade API functions

/**
 * Create Grade API
 * 
 * Creates a new grade/assessment entry in the database.
 * Grades represent individual assignments, quizzes, or exams.
 * 
 * @param {Object} gradeData - Grade creation data
 * @param {string} gradeData.name - Assessment name
 * @param {number} gradeData.maxScore - Maximum possible score
 * @param {number|null} gradeData.score - Actual score received (null if pending)
 * @param {string} gradeData.date - Assessment date
 * @param {string} gradeData.assessmentType - Type of assessment
 * @param {boolean} gradeData.isExtraCredit - Whether it's extra credit
 * @param {number} gradeData.extraCreditPoints - Extra credit points
 * @param {number} gradeData.categoryId - Category ID this grade belongs to
 * @returns {Promise<Object>} Created grade object
 * @throws {Error} If grade creation fails
 */
export async function createGrade(gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/grades`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create grade with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Grades by Category ID API
 * 
 * Retrieves all grades for a specific category.
 * Used for calculating category averages and displaying grade lists.
 * 
 * @param {number} categoryId - Category ID to fetch grades for
 * @returns {Promise<Array>} Array of grade objects
 * @throws {Error} If fetching grades fails
 */
export async function getGradesByCategoryId(categoryId) {
  const response = await fetch(`${API_BASE_URL}/api/grades/category/${categoryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch grades with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Grades by Course ID API
 * 
 * Retrieves all grades for a specific course across all categories.
 * Used for course-wide grade calculations and analytics.
 * 
 * @param {number} courseId - Course ID to fetch grades for
 * @returns {Promise<Array>} Array of grade objects
 * @throws {Error} If fetching grades fails
 */
export async function getGradesByCourseId(courseId) {
  const response = await fetch(`${API_BASE_URL}/api/grades/course/${courseId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch grades with status ${response.status}`);
  }
  return response.json();
}

/**
 * Update Grade API
 * 
 * Updates an existing grade entry with new information.
 * Commonly used to add scores to pending assessments.
 * 
 * @param {number} id - Grade ID to update
 * @param {Object} gradeData - Updated grade data
 * @returns {Promise<Object>} Updated grade object
 * @throws {Error} If grade update fails
 */
export async function updateGrade(id, gradeData) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gradeData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update grade with status ${response.status}`);
  }
  return response.json();
}

/**
 * Delete Grade API
 * 
 * Permanently removes a grade entry from the database.
 * This action cannot be undone.
 * 
 * @param {number} id - Grade ID to delete
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} If grade deletion fails
 */
export async function deleteGrade(id) {
  const response = await fetch(`${API_BASE_URL}/api/grades/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete grade with status ${response.status}`);
  }
  return response.ok;
}

// Goal API functions

/**
 * Create Goal API
 * 
 * Creates a new academic goal for a specific course.
 * Goals help users track their academic progress and targets.
 * 
 * @param {Object} goalData - Goal creation data
 * @param {string} goalData.uid - User ID who owns the goal
 * @param {string} goalData.courseId - Course ID this goal relates to
 * @param {string} goalData.name - Goal name
 * @param {string} goalData.description - Goal description
 * @param {number} goalData.targetGrade - Target grade percentage
 * @param {string} goalData.targetDate - Target completion date
 * @param {string} goalData.status - Goal status (active, completed, failed)
 * @returns {Promise<Object>} Created goal object
 * @throws {Error} If goal creation fails
 */
export async function createGoal(goalData) {
  const response = await fetch(`${API_BASE_URL}/api/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to create goal with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Goals by User ID API
 * 
 * Retrieves all goals for a specific user across all courses.
 * Used for goal overview and progress tracking.
 * 
 * @param {string} uid - Firebase UID of the user
 * @returns {Promise<Array>} Array of goal objects
 * @throws {Error} If fetching goals fails
 */
export async function getGoalsByUid(uid) {
  const response = await fetch(`${API_BASE_URL}/api/goals/user/${encodeURIComponent(uid)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch goals with status ${response.status}`);
  }
  return response.json();
}

/**
 * Get Goals by User ID and Course ID API
 * 
 * Retrieves goals for a specific user and course combination.
 * Used for course-specific goal management.
 * 
 * @param {string} uid - Firebase UID of the user
 * @param {number} courseId - Course ID to fetch goals for
 * @returns {Promise<Array>} Array of goal objects
 * @throws {Error} If fetching goals fails
 */
export async function getGoalsByUidAndCourseId(uid, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/goals/user/${encodeURIComponent(uid)}/course/${encodeURIComponent(courseId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to fetch goals with status ${response.status}`);
  }
  return response.json();
}

/**
 * Update Goal API
 * 
 * Updates an existing goal with new information.
 * Used to modify goal details or update progress status.
 * 
 * @param {number} id - Goal ID to update
 * @param {Object} goalData - Updated goal data
 * @returns {Promise<Object>} Updated goal object
 * @throws {Error} If goal update fails
 */
export async function updateGoal(id, goalData) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to update goal with status ${response.status}`);
  }
  return response.json();
}

/**
 * Delete Goal API
 * 
 * Permanently removes a goal entry from the database.
 * This action cannot be undone.
 * 
 * @param {number} id - Goal ID to delete
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} If goal deletion fails
 */
export async function deleteGoal(id) {
  const response = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Failed to delete goal with status ${response.status}`);
  }
  return response.ok;
}


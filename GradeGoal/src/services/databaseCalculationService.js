/**
 * Service for calling database calculation API endpoints
 * This replaces JavaScript calculations with database-backed calculations
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';

/**
 * Add or update a grade using database calculation
 * @param {Object} gradeData - Grade data to add/update
 * @returns {Promise<Object>} Result from the API
 */
export const addOrUpdateGrade = async (gradeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/grade/add-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessmentId: gradeData.assessmentId,
        pointsEarned: gradeData.pointsEarned,
        pointsPossible: gradeData.pointsPossible,
        percentageScore: gradeData.percentageScore,
        scoreType: gradeData.scoreType || 'PERCENTAGE',
        notes: gradeData.notes || '',
        isExtraCredit: gradeData.isExtraCredit || false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('❌ Error calling AddOrUpdateGrade API:', error);
    return {
      result: `Error: ${error.message}`,
      success: false
    };
  }
};

/**
 * Calculate course grade using database function
 * @param {number} courseId - Course ID
 * @returns {Promise<number>} Calculated course grade percentage
 */
export const calculateCourseGrade = async (courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/course/${courseId}/grade`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.courseGrade || 0;
  } catch (error) {
    console.error('❌ Error calling CalculateCourseGrade API:', error);
    return 0;
  }
};

/**
 * Calculate category grade using database function
 * @param {number} categoryId - Category ID
 * @returns {Promise<number>} Calculated category grade percentage
 */
export const calculateCategoryGrade = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/category/${categoryId}/grade`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.categoryGrade || 0;
  } catch (error) {
    console.error('❌ Error calling CalculateCategoryGrade API:', error);
    return 0;
  }
};

/**
 * Get course with all calculations using database functions
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course with calculated grades
 */
export const getCourseWithCalculations = async (courseId) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/course/${courseId}/with-calculations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Error calling GetCourseWithCalculations API:', error);
    return null;
  }
};

/**
 * Update course grades using database procedure
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Result from the API
 */
export const updateCourseGrades = async (courseId) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/course/${courseId}/update-grades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Error calling UpdateCourseGrades API:', error);
    return {
      result: `Error: ${error.message}`,
      success: false
    };
  }
};

/**
 * Calculate GPA using database function
 * @param {number} userId - User ID
 * @param {string} academicYear - Academic year
 * @param {string} semester - Semester
 * @returns {Promise<number>} Calculated GPA
 */
export const calculateGPA = async (userId, academicYear, semester) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/gpa/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        academicYear: academicYear || '2025',
        semester: semester || 'FIRST'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result.gpa || 0;
  } catch (error) {
    console.error('❌ Error calling CalculateGPA API:', error);
    return 0;
  }
};

/**
 * Award points to user using database procedure
 * @param {number} userId - User ID
 * @param {number} points - Points to award
 * @param {string} activityType - Type of activity
 * @returns {Promise<Object>} Result from the API
 */
export const awardPoints = async (userId, points, activityType) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/user/${userId}/award-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points: points || 10,
        activityType: activityType || 'GRADE_ADDED'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Error calling AwardPoints API:', error);
    return {
      result: `Error: ${error.message}`,
      success: false
    };
  }
};

/**
 * Check goal progress using database procedure
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result from the API
 */
export const checkGoalProgress = async (userId) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/user/${userId}/check-goal-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Error calling CheckGoalProgress API:', error);
    return {
      result: `Error: ${error.message}`,
      success: false
    };
  }
};

/**
 * Check grade alerts using database procedure
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result from the API
 */
export const checkGradeAlerts = async (userId) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/user/${userId}/check-grade-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Error calling CheckGradeAlerts API:', error);
    return {
      result: `Error: ${error.message}`,
      success: false
    };
  }
};

/**
 * Check user achievements using database procedure
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Result from the API
 */
export const checkUserAchievements = async (userId) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/database-calculations/user/${userId}/check-achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Error calling CheckUserAchievements API:', error);
    return {
      result: `Error: ${error.message}`,
      success: false
    };
  }
};

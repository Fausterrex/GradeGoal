// ========================================
// GRADE ENTRY DATA STORE UTILITIES
// ========================================
// This file contains all data management functions for the GradeEntry component
// Functions: Grade saving, data fetching, state management

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

import {
  getGradesByCourseId,
  createGrade,
  updateGrade,
  deleteGrade as deleteGradeApi,
  getAssessmentCategoriesByCourseId,
  addOrUpdateGradeWithCalculation,
  updateCourseGrades,
  getUserProfile,
  awardPoints,
  checkGoalProgress,
  checkGradeAlerts,
  checkAchievements,
} from "../../../../backend/api";

/**
 * Load all grades for a course and organize by category
 */
export const loadCourseGrades = async (courseId) => {
  try {
    const gradesData = await getGradesByCourseId(courseId);
    const transformedGrades = {};
    
    gradesData.forEach((grade) => {
      let categoryId = null;

      // Handle different possible data structures
      if (grade.assessment && grade.assessment.categoryId) {
        categoryId = grade.assessment.categoryId;
      } else if (grade.category && grade.category.id) {
        categoryId = grade.category.id;
      } else if (grade.categoryId) {
        categoryId = grade.categoryId;
      } else if (grade.category_id) {
        categoryId = grade.category_id;
      }

      if (!categoryId) {
        return; // Skip grades without category
      }

      if (!transformedGrades[categoryId]) {
        transformedGrades[categoryId] = [];
      }

      const transformedGrade = {
        id: grade.gradeId || grade.id,
        categoryId: categoryId,
        name: grade.assessment?.assessmentName || grade.name,
        maxScore: grade.assessment?.maxPoints || grade.maxScore,
        score: grade.pointsEarned,
        date: grade.assessment?.dueDate || grade.date,
        assessmentType: "",
        isExtraCredit: grade.isExtraCredit,
        extraCreditPoints: grade.extraCreditPoints,
        note: grade.notes || grade.note,
        createdAt: grade.createdAt,
        updatedAt: grade.updatedAt,
      };
      
      transformedGrades[categoryId].push(transformedGrade);
    });
    
    return { success: true, grades: transformedGrades };
  } catch (error) {
    console.error('Failed to load course grades:', error);
    return { success: false, error: error.message, grades: {} };
  }
};

/**
 * Load assessment categories for a course
 */
export const loadAssessmentCategories = async (courseId) => {
  try {
    const categoriesData = await getAssessmentCategoriesByCourseId(courseId);

    const transformedCategories = categoriesData.map((category) => ({
      id: category.categoryId || category.id,
      name: category.categoryName || category.name,
      weight: category.weightPercentage || category.weight,
      weightPercentage: category.weightPercentage || category.weight,
      orderSequence: category.orderSequence,
    }));

    return { success: true, categories: transformedCategories };
  } catch (error) {
    console.error('Failed to load assessment categories:', error);
    return { success: false, error: error.message, categories: [] };
  }
};

/**
 * Get user ID from current user email
 */
export const getUserIdFromEmail = async (email) => {
  try {
    const userProfile = await getUserProfile(email);
    return { success: true, userId: userProfile.userId };
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return { success: false, error: error.message, userId: null };
  }
};

/**
 * Save grade with automatic calculations
 * Tries database calculation API first, falls back to regular API
 */
export const saveGradeWithCalculation = async (gradeData, currentUserId) => {
  let usedDatabaseCalculation = false;
  
  try {
    // Try database calculation API first
    const dbResult = await addOrUpdateGradeWithCalculation(gradeData);
    
    // Check if the result indicates an error despite success=true
    if (dbResult.success && dbResult.result && dbResult.result.includes('Error:')) {
      throw new Error(dbResult.result);
    }
    
    usedDatabaseCalculation = true;
    return { 
      success: true, 
      result: dbResult.result, 
      usedDatabaseCalculation 
    };
  } catch (calcError) {
    // Fall back to regular grade update API
    try {
      const regularGradeData = {
        name: gradeData.name,
        maxScore: gradeData.pointsPossible,
        score: gradeData.pointsEarned,
        date: gradeData.date,
        assessmentType: "",
        isExtraCredit: gradeData.isExtraCredit,
        extraCreditPoints: gradeData.extraCreditPoints || null,
        note: gradeData.notes || "",
        categoryId: gradeData.categoryId,
      };

      await updateGrade(gradeData.assessmentId, regularGradeData);
      
      return { 
        success: true, 
        result: 'Grade updated via regular API', 
        usedDatabaseCalculation: false 
      };
    } catch (fallbackError) {
      return { 
        success: false, 
        error: fallbackError.message, 
        usedDatabaseCalculation: false 
      };
    }
  }
};

/**
 * Create a new assessment
 */
export const createNewAssessment = async (assessmentData) => {
  try {
    const result = await createGrade(assessmentData);
    return { success: true, assessment: result };
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing assessment
 */
export const updateExistingAssessment = async (assessmentId, assessmentData) => {
  try {
    const result = await updateGrade(assessmentId, assessmentData);
    return { success: true, assessment: result };
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete an assessment
 */
export const deleteAssessment = async (assessmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assessments/${assessmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to delete assessment with status ${response.status}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete assessment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Award points and trigger achievement checks
 */
export const awardPointsAndCheckAchievements = async (userId, points, activityType) => {
  try {
    await awardPoints(userId, points, activityType);
    await checkGoalProgress(userId);
    await checkGradeAlerts(userId);
    
    // Check for achievements (this will award achievements and send notifications)
    await checkAchievements(userId);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to process achievements/points:', error);
    return { success: false, error: error.message };
  }
};


/**
 * Update grades state after adding/editing a score
 */
export const updateGradesState = (prevGrades, categoryId, gradeId, updatedGradeData) => {
  const updatedGrades = { ...prevGrades };
  
  if (updatedGrades[categoryId]) {
    const gradeIndex = updatedGrades[categoryId].findIndex(
      (g) => g.id === gradeId
    );
    if (gradeIndex !== -1) {
      updatedGrades[categoryId][gradeIndex] = {
        ...updatedGrades[categoryId][gradeIndex],
        ...updatedGradeData,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  
  return updatedGrades;
};

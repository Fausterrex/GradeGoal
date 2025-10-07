// ========================================
// GRADE ENTRY CALCULATIONS UTILITIES
// ========================================
// This file contains all calculation-related functions for the GradeEntry component
// Functions: GPA calculations, course grade calculations, category averages

import {
  calculateCourseGrade,
  calculateCourseGPA,
  calculateCategoryGrade,
  calculateGPAFromPercentage,
  calculateAndSaveCourseGrade,
} from "../../../../backend/api";
/**
 * Calculate and save course grade and GPA to database
 * This function handles the complete calculation and storage process
 */
export const calculateAndStoreCourseGrade = async (courseId) => {
  try {
    const courseGradeResult = await calculateAndSaveCourseGrade(courseId);
    
    if (!courseGradeResult.success) {
      console.error('Course grade calculation failed:', courseGradeResult.error);
      return { success: false, error: courseGradeResult.error };
    }
    
    return {
      success: true,
      courseGrade: courseGradeResult.courseGrade,
      gpa: courseGradeResult.gpa,
      message: courseGradeResult.message
    };
  } catch (error) {
    console.error('Failed to calculate course grade:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate category average using database calculation
 * Falls back to provided function if database calculation fails
 */
export const calculateCategoryAverage = async (categoryId, fallbackFunction = null) => {
  try {
    const result = await calculateCategoryGrade(categoryId);
    if (result.success && result.categoryGrade !== null) {
      return parseFloat(result.categoryGrade);
    }
    
    // Fallback to provided function if available
    if (fallbackFunction) {
      return await fallbackFunction(categoryId);
    }
    
    return null;
  } catch (error) {
    // Fallback to provided function if available
    if (fallbackFunction) {
      try {
        return await fallbackFunction(categoryId);
      } catch (fallbackError) {
        return null;
      }
    }
    return null;
  }
};

/**
 * Calculate GPA for a given percentage
 * Returns formatted GPA string
 */
export const calculateGPAForPercentage = async (percentage) => {
  try {
    const result = await calculateGPAFromPercentage(percentage);
    if (result.success) {
      // Handle both string and number results
      const gpaValue = typeof result.gpa === 'string' ? result.gpa : result.gpa.toString();
      return gpaValue === 'R' ? 'R' : parseFloat(gpaValue).toFixed(2);
    }
    return "0.00";
  } catch (error) {
    return "0.00";
  }
};

/**
 * Calculate individual assessment percentage
 */
export const calculateAssessmentPercentage = (score, maxScore) => {
  if (!score || !maxScore || isNaN(score) || isNaN(maxScore) || maxScore === 0) {
    return null;
  }
  return (parseFloat(score) / parseFloat(maxScore)) * 100;
};

/**
 * Determine if an assessment has a valid score
 */
export const hasValidScore = (grade) => {
  return (
    grade.score !== null &&
    grade.score !== undefined &&
    grade.score !== "" &&
    grade.score !== 0 &&
    !isNaN(parseFloat(grade.score))
  );
};

/**
 * Get grade color based on percentage
 */
export const getGradeColor = (percentage) => {
  if (percentage >= 90) return "text-green-600";
  if (percentage >= 80) return "text-blue-600";
  if (percentage >= 70) return "text-yellow-600";
  if (percentage >= 60) return "text-orange-600";
  return "text-red-600";
};

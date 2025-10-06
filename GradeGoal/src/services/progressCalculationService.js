// ========================================
// PROGRESS CALCULATION SERVICE
// ========================================
// Centralized service for calculating course progress across all components
// This ensures consistency and eliminates duplicate calculation logic

import { hasValidScore } from '../components/course/course_details/utils/gradeEntryCalculations';

/**
 * Calculate overall course progress based on semester term completion
 * This is the single source of truth for progress calculation
 * 
 * @param {Object} course - Course object with completion status
 * @param {Array} categories - Assessment categories (optional, for fallback)
 * @param {Object} grades - Grades data (optional, for fallback)
 * @returns {number} Progress percentage (0-100)
 */
export const calculateCourseProgress = (course, categories = null, grades = null) => {
  // Priority 1: Course is fully completed
  if (course.isCompleted === true) {
    return 100;
  }
  
  // Priority 2: Calculate progress based on term completion and assessments
  if (course.isMidtermCompleted !== undefined && categories && grades) {
    // Calculate midterm progress based on completed assessments
    const midtermProgress = calculateMidtermProgress(categories, grades);
    
    // Calculate final term progress based on completed assessments
    const finalTermProgress = calculateFinalTermProgress(categories, grades);
    
    // Total progress = midterm progress + final term progress
    const totalProgress = midtermProgress + finalTermProgress;
    
    return Math.min(totalProgress, 100); // Cap at 100%
  }
  
  // Priority 3: Use midterm completion status if available (fallback)
  if (course.isMidtermCompleted !== undefined) {
    return course.isMidtermCompleted ? 50 : 0;
  }
  
  // Priority 4: Fallback to assessment-based calculation with improved logic
  if (categories && grades) {
    const assessmentProgress = calculateAssessmentBasedProgress(categories, grades);
    
    // Check if midterm assessments are completed by analyzing actual grades
    const hasMidtermAssessments = checkMidtermCompletion(categories, grades);
    
    if (hasMidtermAssessments) {
      // If midterm assessments are completed, show at least 50% progress
      const finalTermProgress = calculateFinalTermProgress(categories, grades);
      return Math.min(50 + finalTermProgress, 100);
    }
    
    return assessmentProgress;
  }
  
  // Priority 5: Default fallback
  return 0;
};

/**
 * Calculate midterm progress based on completed assessments
 * @param {Array} categories - Assessment categories
 * @param {Object} grades - Grades data
 * @returns {number} Midterm progress percentage (0-50)
 */
const calculateMidtermProgress = (categories, grades) => {
  if (!categories || categories.length === 0) return 0;
  
  let totalExpectedAssessments = 0;
  let completedAssessments = 0;
  
  categories.forEach((category) => {
    // Filter grades for MIDTERM only
    const midtermGrades = (grades[category.id] || []).filter(grade => 
      grade.semesterTerm === 'MIDTERM'
    );
    
    // Each category should have at least 1 assessment for a complete midterm
    const expectedInCategory = Math.max(midtermGrades.length, 1);
    totalExpectedAssessments += expectedInCategory;
    
    // Count completed assessments in this category for midterm
    midtermGrades.forEach((grade) => {
      if (hasValidScore(grade)) {
        completedAssessments++;
      }
    });
  });
  
  // Calculate midterm progress (0-50% of total course progress)
  const midtermProgress = totalExpectedAssessments > 0 ? 
    (completedAssessments / totalExpectedAssessments) * 50 : 0;
  
  return midtermProgress;
};

/**
 * Calculate final term progress based on completed assessments
 * @param {Array} categories - Assessment categories
 * @param {Object} grades - Grades data
 * @returns {number} Final term progress percentage (0-50)
 */
const calculateFinalTermProgress = (categories, grades) => {
  if (!categories || categories.length === 0) return 0;
  
  let totalExpectedAssessments = 0;
  let completedAssessments = 0;
  
  categories.forEach((category) => {
    // Filter grades for FINAL_TERM only
    const finalTermGrades = (grades[category.id] || []).filter(grade => 
      grade.semesterTerm === 'FINAL_TERM'
    );
    
    // Each category should have at least 1 assessment for a complete final term
    const expectedInCategory = Math.max(finalTermGrades.length, 1);
    totalExpectedAssessments += expectedInCategory;
    
    // Count completed assessments in this category for final term
    finalTermGrades.forEach((grade) => {
      if (hasValidScore(grade)) {
        completedAssessments++;
      }
    });
  });
  
  // Calculate final term progress (0-50% of total course progress)
  const finalTermProgress = totalExpectedAssessments > 0 ? 
    (completedAssessments / totalExpectedAssessments) * 50 : 0;
  
  return finalTermProgress;
};

/**
 * Check if midterm assessments are completed by analyzing actual grades
 * @param {Array} categories - Assessment categories
 * @param {Object} grades - Grades data
 * @returns {boolean} True if midterm assessments are completed
 */
const checkMidtermCompletion = (categories, grades) => {
  if (!categories || categories.length === 0) return false;
  
  let hasMidtermAssessments = false;
  let completedMidtermAssessments = 0;
  let totalMidtermAssessments = 0;
  
  categories.forEach((category) => {
    const categoryGrades = grades[category.id] || [];
    
    // Filter for midterm assessments only
    const midtermGrades = categoryGrades.filter(grade => 
      grade.semesterTerm === 'MIDTERM'
    );
    
    if (midtermGrades.length > 0) {
      hasMidtermAssessments = true;
      totalMidtermAssessments += midtermGrades.length;
      
      // Count completed midterm assessments
      midtermGrades.forEach((grade) => {
        if (hasValidScore(grade)) {
          completedMidtermAssessments++;
        }
      });
    }
  });
  
  // Consider midterm completed if we have assessments and most/all are completed
  return hasMidtermAssessments && completedMidtermAssessments > 0 && 
         (completedMidtermAssessments / totalMidtermAssessments) >= 0.8; // 80% threshold
};

/**
 * Calculate progress based on assessment completion (fallback method)
 * @param {Array} categories - Assessment categories
 * @param {Object} grades - Grades data
 * @returns {number} Progress percentage (0-100)
 */
const calculateAssessmentBasedProgress = (categories, grades) => {
  if (!categories || categories.length === 0) return 0;
  
  let totalExpectedAssessments = 0;
  let completedAssessments = 0;
  
  categories.forEach((category) => {
    const categoryGrades = grades[category.id] || [];
    
    // Each category should have at least 1 assessment for a complete course
    const expectedInCategory = Math.max(categoryGrades.length, 1);
    totalExpectedAssessments += expectedInCategory;
    
    // Count completed assessments in this category
    categoryGrades.forEach((grade) => {
      if (hasValidScore(grade)) {
        completedAssessments++;
      }
    });
  });
  
  return totalExpectedAssessments > 0 ? (completedAssessments / totalExpectedAssessments) * 100 : 0;
};


/**
 * Get progress status text based on progress percentage
 * @param {number} progress - Progress percentage
 * @returns {string} Status text
 */
export const getProgressStatus = (progress) => {
  if (progress >= 100) return "Completed";
  if (progress >= 75) return "Almost Complete";
  if (progress >= 50) return "Midterm Done";
  if (progress > 0) return "In Progress";
  return "Not Started";
};

/**
 * Get progress color based on progress percentage
 * @param {number} progress - Progress percentage
 * @returns {string} CSS color class
 */
export const getProgressColor = (progress) => {
  if (progress >= 100) return "text-green-600";
  if (progress >= 75) return "text-green-500";
  if (progress >= 50) return "text-blue-600";
  if (progress > 0) return "text-yellow-600";
  return "text-gray-600";
};
